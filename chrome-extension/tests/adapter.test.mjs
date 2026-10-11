import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from '../node_modules/typescript/lib/typescript.js';

test('adapter only exports permitted job metadata and user-click form assistance', async () => {
  const source = await readFile(new URL('../src/adapter.ts', import.meta.url), 'utf8');
  assert.match(source, /application\/ld\+json/);
  assert.match(source, /JobPosting/);
  assert.match(source, /function fillVisibleForm/);
  assert.doesNotMatch(source, /document\.cookie|localStorage|sessionStorage|submit\(/i);
});

test('manifest requests only active-tab interaction and explicit API hosts', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(new Set(manifest.permissions), new Set(['activeTab', 'alarms', 'scripting', 'storage']));
  assert.ok(manifest.content_scripts.some((entry) => entry.js.includes('dashboard-bridge.js')));
  assert.ok(manifest.host_permissions.every((origin) => [
    'http://localhost:3000/*',
    'https://job-applyer-api.onrender.com/*',
    'http://localhost:5173/*',
    'https://*.web.app/*',
    'https://*.firebaseapp.com/*',
  ].includes(origin)));
  assert.ok(!manifest.host_permissions.includes('<all_urls>'));
});

test('dashboard pairing bridge only accepts same-origin dashboard messages', async () => {
  const source = await readFile(new URL('../src/dashboard-bridge.ts', import.meta.url), 'utf8');
  assert.match(source, /event\.source !== window/);
  assert.match(source, /event\.origin !== location\.origin/);
  assert.match(source, /pair-extension/);
});

test('generic adapter extracts only title, company, location, URL and hostname from JobPosting JSON-LD', async () => {
  const source = await readFile(new URL('../src/adapter.ts', import.meta.url), 'utf8');
  const javascript = ts.transpile(source, { target: ts.ScriptTarget.ES2022 });
  const pageUrl = 'https://jobs.example.com/roles/42';
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: '  Staff Engineer ',
    hiringOrganization: { name: 'Example Corp' },
    jobLocation: { address: { addressLocality: 'Remote' } },
    description: 'Must not be exported',
  });
  const context = {
    URL,
    location: { href: pageUrl },
    document: {
      querySelectorAll: () => [{ textContent: jsonLd }],
    },
  };
  vm.runInNewContext(javascript, context);

  assert.deepEqual(
    JSON.parse(JSON.stringify(vm.runInNewContext('readJobPosting()', context))),
    {
      title: 'Staff Engineer',
      company: 'Example Corp',
      location: 'Remote',
      url: pageUrl,
      platform: 'jobs.example.com',
    },
  );
});
