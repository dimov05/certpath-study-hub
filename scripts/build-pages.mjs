import { readdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const projectRoot = process.cwd();
const binName = process.platform === 'win32' ? 'vinext.cmd' : 'vinext';
const vinext = path.join(projectRoot, 'node_modules', '.bin', binName);
const result = spawnSync(vinext, ['build'], {
  cwd: projectRoot,
  env: { ...process.env, GITHUB_PAGES: 'true' },
  stdio: 'inherit',
});

if (result.status !== 0) process.exit(result.status ?? 1);

const rawBasePath = process.env.BASE_PATH ?? '';
const basePath = rawBasePath && rawBasePath !== '/'
  ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}`
  : '';

if (!basePath) process.exit(0);

const outputDirectory = path.join(projectRoot, 'dist', 'client');
const textExtensions = new Set(['.html', '.rsc', '.css', '.js', '.json']);

async function rewriteAssets(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteAssets(filePath);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name)) && entry.name !== '_headers') continue;
    const original = await readFile(filePath, 'utf8');
    const updated = original.replaceAll('/_next/', `${basePath}/_next/`);
    if (updated !== original) await writeFile(filePath, updated);
  }
}

await rewriteAssets(outputDirectory);
console.log(`Rewrote static asset URLs for GitHub Pages base path: ${basePath}`);
