function readJobPosting(): JobListing | null {
  const currentUrl = new URL(location.href);
  const allowedProtocols = currentUrl.protocol === 'https:' || currentUrl.hostname === 'localhost';
  if (!allowedProtocols) return null;

  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of scripts) {
    try {
      const parsed: unknown = JSON.parse(script.textContent || '');
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const job = candidates
        .flatMap((candidate) => {
          if (!candidate || typeof candidate !== 'object') return [];
          const record = candidate as Record<string, unknown>;
          return Array.isArray(record['@graph']) ? record['@graph'] : [record];
        })
        .find((candidate) => {
          if (!candidate || typeof candidate !== 'object') return false;
          const type = (candidate as Record<string, unknown>)['@type'];
          return type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'));
        }) as Record<string, unknown> | undefined;
      if (!job) continue;

      const organization = job.hiringOrganization as Record<string, unknown> | undefined;
      const location = job.jobLocation as Record<string, unknown> | undefined;
      const address = location?.address as Record<string, unknown> | undefined;
      const title = typeof job.title === 'string' ? job.title.trim() : '';
      const company = typeof organization?.name === 'string' ? organization.name.trim() : '';
      if (!title || !company) continue;
      return {
        title: title.slice(0, 250),
        company: company.slice(0, 200),
        location: typeof address?.addressLocality === 'string' ? address.addressLocality.slice(0, 200) : '',
        url: currentUrl.href.slice(0, 2048),
        platform: currentUrl.hostname,
      };
    } catch {
      continue;
    }
  }
  return null;
}

function readSelectedPost(): SelectedPost | null {
  const currentUrl = new URL(location.href);
  if (currentUrl.protocol !== 'https:' && currentUrl.hostname !== 'localhost') return null;
  const text = window.getSelection()?.toString().trim().slice(0, 40000) || '';
  if (!text) return null;
  return { text, url: currentUrl.href.slice(0, 2048), title: document.title.slice(0, 250) };
}

function fillVisibleForm(profile: Record<string, string>): { filled: number; unsupported: string[] } {
  const fields: Array<[RegExp, keyof typeof profile]> = [
    [/first.?name/i, 'firstName'],
    [/last.?name/i, 'lastName'],
    [/e.?mail/i, 'email'],
    [/phone|mobile/i, 'phone'],
    [/city/i, 'city'],
    [/linkedin/i, 'linkedinUrl'],
    [/portfolio|website/i, 'portfolioUrl'],
  ];
  const unsupported = new Set<string>();
  let filled = 0;
  const candidates = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input:not([type="hidden"]):not([type="password"]), textarea, select',
  )).filter((field) => field.offsetParent !== null
    && !field.disabled
    && (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement) || !field.readOnly));

  for (const field of candidates) {
    const label = field.labels?.[0]?.textContent?.trim() || '';
    const text = `${label} ${field.getAttribute('aria-label') || ''} ${field.name} ${field.autocomplete}`;
    const match = fields.find(([pattern]) => pattern.test(text));
    if (!match || !profile[match[1]]) {
      if (text.trim()) unsupported.add(text.trim().slice(0, 100));
      continue;
    }
    field.focus();
    field.value = profile[match[1]];
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    filled++;
  }
  return { filled, unsupported: Array.from(unsupported).slice(0, 20) };
}
