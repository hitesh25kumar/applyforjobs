const CONNECTION_KEY = 'jobApplyerConnection';
const HEARTBEAT_ALARM = 'jobApplyerHeartbeat';
const RETRY_KEY = 'jobApplyerRetryCount';

importScripts('adapter.js');

async function getConnection(): Promise<StoredConnection | null> {
  const stored = await chrome.storage.local.get([CONNECTION_KEY]);
  return (stored[CONNECTION_KEY] as StoredConnection | undefined) || null;
}

async function apiRequest<T>(
  connection: StoredConnection,
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${connection.apiBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${connection.token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 401) {
    await chrome.storage.local.remove([CONNECTION_KEY]);
    throw new Error('Extension pairing expired. Pair again from the dashboard.');
  }
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(result.message || `API request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

async function prepareJob(): Promise<ExtensionResponse> {
  const connection = await getConnection();
  if (!connection) throw new Error('Connect this extension from the dashboard first.');
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id || !tab.url?.startsWith('http')) throw new Error('Open a job listing in the current tab first.');
  const [{ result: job }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: readJobPosting,
  });
  if (!job) throw new Error('This page has no supported JobPosting metadata. No page data was sent.');
  const task = await apiRequest<TaskRecord>(connection, '/extension/tasks', 'POST', {
    id: crypto.randomUUID(),
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    platform: job.platform,
  });
  return { ok: true, taskId: task.id, job };
}

async function fillForm(taskId: string): Promise<ExtensionResponse> {
  const connection = await getConnection();
  if (!connection) throw new Error('Connect this extension from the dashboard first.');
  const task = await apiRequest<TaskRecord>(connection, `/extension/tasks/${encodeURIComponent(taskId)}`);
  if (task.state !== 'awaiting_user_review') throw new Error('This task is no longer awaiting review.');
  const profile = await apiRequest<Record<string, string>>(connection, '/extension/profile');
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id || tab.url !== task.job.url) throw new Error('Return to the job page before preparing its form.');
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: fillVisibleForm,
    args: [profile],
  });
  await apiRequest(connection, `/extension/tasks/${encodeURIComponent(taskId)}/prepared`, 'POST', {
    filledFields: result?.filled || 0,
    unsupportedFields: result?.unsupported || [],
  });
  return { ok: true, message: `Prepared ${result?.filled || 0} fields. Review every field and submit yourself.` };
}

chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== HEARTBEAT_ALARM) return;
  void getConnection().then(async (connection) => {
    if (connection) await apiRequest(connection, '/extension/heartbeat', 'POST');
    await chrome.storage.local.remove([RETRY_KEY]);
    chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: 1 });
  }).catch(async (error: unknown) => {
    console.warn('[Job Applyer] Heartbeat failed:', error);
    const stored = await chrome.storage.local.get([RETRY_KEY]);
    const attempt = Math.min(Number(stored[RETRY_KEY] || 0) + 1, 5);
    await chrome.storage.local.set({ [RETRY_KEY]: attempt });
    chrome.alarms.create(HEARTBEAT_ALARM, { delayInMinutes: Math.min(30, 2 ** attempt) });
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void (async (): Promise<ExtensionResponse> => {
    if (message.type === 'status') {
      const connection = await getConnection();
      if (!connection) return { ok: true, status: 'disconnected' };
      if (Date.parse(connection.expiresAt) <= Date.now()) {
        await chrome.storage.local.remove([CONNECTION_KEY]);
        return { ok: true, status: 'disconnected', message: 'Pairing expired.' };
      }
      try {
        await apiRequest(connection, '/extension/heartbeat', 'POST');
        return { ok: true, status: 'connected' };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Connection failed.';
        if (message.includes('Pairing expired')) {
          return { ok: false, status: 'disconnected', message };
        }
        return { ok: false, status: 'error', message };
      }
    }
    if (message.type === 'pair' || message.type === 'page-pair') {
      const apiBaseUrl = (message.apiBaseUrl || '').replace(/\/+$/, '');
      if (!/^https:\/\/[^/]+$/.test(apiBaseUrl) && apiBaseUrl !== 'http://localhost:3000') {
        throw new Error('Use a secure HTTPS API URL (localhost is allowed for development).');
      }
      const response = await fetch(`${apiBaseUrl}/extension/pair/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: message.code?.trim() }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(
          failure.message
          || `Pairing failed at ${apiBaseUrl} (HTTP ${response.status}). Check that the code and API URL belong to the same environment.`,
        );
      }
      const token = await response.json() as { token: string; expiresAt: string };
      await chrome.storage.local.set({ [CONNECTION_KEY]: { apiBaseUrl, ...token } satisfies StoredConnection });
      return { ok: true, status: 'connected' };
    }
    if (message.type === 'prepare-current-job') return await prepareJob();
    if (message.type === 'fill-current-form') {
      if (!message.taskId) throw new Error('Choose a prepared job first.');
      return await fillForm(message.taskId);
    }
    if (message.type === 'disconnect') {
      const connection = await getConnection();
      if (connection) {
        await apiRequest(connection, '/extension/disconnect', 'POST').catch(() => undefined);
      }
      await chrome.storage.local.remove([CONNECTION_KEY]);
      return { ok: true, status: 'disconnected' };
    }
    return { ok: false, message: 'Unsupported extension request.' };
  })().then(sendResponse).catch((error: unknown) => sendResponse({
    ok: false,
    status: 'error',
    message: error instanceof Error ? error.message : 'Unexpected extension error.',
  }));
  return true;
});
