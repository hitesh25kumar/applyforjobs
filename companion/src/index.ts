import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const apiFlagIndex = args.indexOf('--api');
const apiUrl = (
  (apiFlagIndex >= 0 ? args[apiFlagIndex + 1] : undefined)
  ?? args.find(argument => argument.startsWith('--api='))?.slice('--api='.length)
  ?? process.env.API_URL
  ?? process.env.VITE_API_URL
  ?? 'http://localhost:3000'
).replace(/\/$/, '');

if (!/^https?:\/\//i.test(apiUrl)) {
  console.error('The API URL must start with http:// or https://.');
  process.exitCode = 1;
} else {
  const companionDirectory = path.dirname(fileURLToPath(import.meta.url));
  const runnerDirectory = path.resolve(companionDirectory, '../../backend/automation');
  const npmArguments = ['run', 'linkedin:local', '--', '--api', apiUrl];
  const npmCli = process.env.npm_execpath;
  const child = npmCli
    ? spawn(process.execPath, [npmCli, ...npmArguments], { cwd: runnerDirectory, stdio: 'inherit' })
    : spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', npmArguments, {
      cwd: runnerDirectory,
      stdio: 'inherit',
      shell: false,
    });

  child.once('error', error => {
    console.error(`Could not start the local LinkedIn runner: ${error.message}`);
    process.exitCode = 1;
  });
  child.once('exit', (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });
}
