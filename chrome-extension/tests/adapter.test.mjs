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
  assert.deepEqual(new Set(manifest.permissions), new Set(['activeTab', 'alarms', 'scripting', 'storage', 'windows']));
  assert.ok(manifest.content_scripts.some((entry) => entry.js.includes('dashboard-bridge.js')));
  assert.ok(manifest.host_permissions.every((origin) => [
    'http://localhost:3000/*',
    'https://job-applyer-api.onrender.com/*',
    'http://localhost:5173/*',
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

test('selected-post adapter sends only the text the user selected', async () => {
  const source = await readFile(new URL('../src/adapter.ts', import.meta.url), 'utf8');
  const javascript = ts.transpile(source, { target: ts.ScriptTarget.ES2022 });
  const context = {
    URL,
    location: { href: 'https://www.linkedin.com/feed/update/urn:li:activity:123' },
    document: { title: 'LinkedIn Feed' },
    window: { getSelection: () => ({ toString: () => 'Hiring a React engineer. Contact jobs@acme.io' }) },
  };
  vm.runInNewContext(javascript, context);

  assert.deepEqual(
    JSON.parse(JSON.stringify(vm.runInNewContext('readSelectedPost()', context))),
    {
      text: 'Hiring a React engineer. Contact jobs@acme.io',
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:123',
      title: 'LinkedIn Feed',
    },
  );
});

test('visible-window action opens only a valid HTTPS URL in a focused normal Chrome window', async () => {
  const source = await readFile(new URL('../src/background.ts', import.meta.url), 'utf8');
  const javascript = ts.transpile(source, { target: ts.ScriptTarget.ES2022 });
  const createdWindows = [];
  const context = {
    URL,
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    importScripts: () => {},
    chrome: {
      alarms: { create: () => {}, onAlarm: { addListener: () => {} } },
      runtime: { onMessage: { addListener: () => {} } },
      storage: { local: { get: async () => ({}), set: async () => {}, remove: async () => {} } },
      windows: {
        create: async (details) => {
          createdWindows.push(details);
          return { id: 42 };
        },
      },
    },
  };
  vm.runInNewContext(javascript, context);

  const windowId = await vm.runInNewContext(
    'openVisibleAutomationWindow("https://www.linkedin.com/feed/")',
    context,
  );

  assert.equal(windowId, 42);
  assert.deepEqual(JSON.parse(JSON.stringify(createdWindows)), [{
    url: 'https://www.linkedin.com/feed/',
    focused: true,
    type: 'normal',
  }]);
  await assert.rejects(
    vm.runInNewContext('openVisibleAutomationWindow("javascript:alert(1)")', context),
    /Only HTTPS pages/,
  );
  assert.equal(createdWindows.length, 1);
});

test('recruiter run survives service-worker restart and posts only user-selected text', async () => {
  const source = await readFile(new URL('../src/background.ts', import.meta.url), 'utf8');
  const javascript = ts.transpile(source, { target: ts.ScriptTarget.ES2022 });
  const storage = {
    jobApplyerConnection: {
      apiBaseUrl: 'https://api.example.test',
      token: 'paired-extension-token',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    },
  };
  const requests = [];
  const createContext = (withTabs) => ({
    URL,
    console,
    importScripts: () => {},
    readSelectedPost: () => ({
      text: 'Hiring a React engineer. Contact jobs@acme.io',
      url: 'https://jobs.example.test/post/1',
      title: 'Engineering role',
    }),
    fetch: async (url, options) => {
      requests.push({ url, options });
      const body = url.endsWith('/extension/recruiter/runs')
        ? { _id: '507f1f77bcf86cd799439011', maxPosts: 25 }
        : { accepted: true, postNumber: 1 };
      return { ok: true, status: 200, json: async () => body };
    },
    chrome: {
      alarms: { create: () => {}, onAlarm: { addListener: () => {} } },
      runtime: { onMessage: { addListener: () => {} } },
      storage: {
        local: {
          get: async (keys) => Object.fromEntries(keys.filter((key) => key in storage).map((key) => [key, storage[key]])),
          set: async (values) => Object.assign(storage, values),
          remove: async (keys) => keys.forEach((key) => delete storage[key]),
        },
      },
      windows: { create: async () => ({ id: 9 }) },
      tabs: withTabs ? { query: async () => [{ id: 4, url: 'https://jobs.example.test/post/1' }] } : undefined,
      scripting: withTabs ? { executeScript: async () => [{ result: {
        text: 'Hiring a React engineer. Contact jobs@acme.io',
        url: 'https://jobs.example.test/post/1',
        title: 'Engineering role',
      } }] } : undefined,
    },
  });

  const firstWorker = createContext(false);
  vm.runInNewContext(javascript, firstWorker);
  const startResult = await vm.runInNewContext(
    'startRecruiterRun("https://jobs.example.test/search")',
    firstWorker,
  );
  assert.equal(startResult.runId, '507f1f77bcf86cd799439011');
  assert.equal(storage.jobApplyerActiveRecruiterRun.id, startResult.runId);

  const restartedWorker = createContext(true);
  vm.runInNewContext(javascript, restartedWorker);
  const captureResult = await vm.runInNewContext('captureSelectedPost()', restartedWorker);

  assert.equal(captureResult.postNumber, 1);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(({ options }) => options.headers.Authorization === 'Bearer paired-extension-token'));
  assert.equal(requests[1].url, 'https://api.example.test/extension/recruiter/runs/507f1f77bcf86cd799439011/posts');
  assert.deepEqual(JSON.parse(requests[1].options.body), {
    postText: 'Hiring a React engineer. Contact jobs@acme.io',
    sourceUrl: 'https://jobs.example.test/post/1',
  });
});
