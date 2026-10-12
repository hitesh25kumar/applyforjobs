import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
await cp(new URL('../manifest.json', import.meta.url), new URL('manifest.json', output));
await cp(new URL('../popup.html', import.meta.url), new URL('popup.html', output));
const apiBaseUrl = process.env.JOB_APPLYER_API_URL
  || (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://job-applyer-api.onrender.com');
const apiUrl = new URL(apiBaseUrl);
if (apiUrl.protocol !== 'https:' && apiUrl.hostname !== 'localhost') {
  throw new Error('JOB_APPLYER_API_URL must use HTTPS (localhost is allowed for development).');
}
const manifestPath = new URL('manifest.json', output);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const apiHostPermission = `${apiUrl.protocol}//${apiUrl.host}/*`;
const isDevelopment = process.env.NODE_ENV === 'development';
const dashboardHostPermissions = isDevelopment ? ['http://localhost:5173/*'] : [];
const dashboardMatches = isDevelopment ? ['http://localhost:5173/*'] : [];
const dashboardOrigin = process.env.JOB_APPLYER_DASHBOARD_ORIGIN;
if (dashboardOrigin) {
  const dashboardUrl = new URL(dashboardOrigin);
  if (dashboardUrl.protocol !== 'https:' && dashboardUrl.hostname !== 'localhost') {
    throw new Error('JOB_APPLYER_DASHBOARD_ORIGIN must use HTTPS (localhost is allowed for development).');
  }
  const exactDashboardMatch = `${dashboardUrl.protocol}//${dashboardUrl.host}/*`;
  dashboardHostPermissions.push(exactDashboardMatch);
  dashboardMatches.push(exactDashboardMatch);
}
manifest.content_scripts = dashboardMatches.length
  ? [{ matches: [...new Set(dashboardMatches)], js: ['dashboard-bridge.js'], run_at: 'document_start' }]
  : [];
manifest.host_permissions = [...new Set([...dashboardHostPermissions, apiHostPermission])];
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const popupPath = new URL('popup.html', output);
const popup = (await readFile(popupPath, 'utf8')).replaceAll('__API_BASE_URL__', apiBaseUrl);
await writeFile(popupPath, popup);
if (manifest.manifest_version !== 3 || !manifest.background?.service_worker) {
  throw new Error('Generated extension manifest is not a valid MV3 service-worker manifest.');
}
for (const asset of [manifest.background.service_worker, 'adapter.js', 'popup.js', 'popup.html']) {
  await readFile(new URL(asset, output));
}
await writeFile(new URL('BUILD_OK', output), 'Manifest V3 extension build completed.\n');
