import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(srcPath, destPath) {
  mkdirp(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
}

function copyHtml(srcPath, destPath) {
  let html = fs.readFileSync(srcPath, 'utf8');
  html = html.replace(/ type="module"/g, '');
  mkdirp(path.dirname(destPath));
  fs.writeFileSync(destPath, html);
}

async function minifyCss(srcPath, destPath) {
  const css = fs.readFileSync(srcPath, 'utf8');
  const result = await esbuild.transform(css, { loader: 'css', minify: true });
  mkdirp(path.dirname(destPath));
  fs.writeFileSync(destPath, result.code);
}

async function build() {
  if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
  mkdirp(dist);

  copyFile(path.join(root, 'manifest.json'), path.join(dist, 'manifest.json'));
  mkdirp(path.join(dist, 'icons'));
  for (const icon of ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png']) {
    copyFile(path.join(root, 'icons', icon), path.join(dist, 'icons', icon));
  }

  copyHtml(path.join(src, 'settings', 'settings.html'), path.join(dist, 'settings', 'settings.html'));
  await minifyCss(path.join(src, 'settings', 'settings.css'), path.join(dist, 'settings', 'settings.css'));

  const common = {
    bundle: true,
    minify: true,
    target: 'es2020',
  };

  await Promise.all([
    esbuild.build({
      ...common,
      entryPoints: [path.join(src, 'background', 'service-worker.ts')],
      format: 'esm',
      outfile: path.join(dist, 'background', 'service-worker.js'),
    }),
    esbuild.build({
      ...common,
      entryPoints: [path.join(src, 'content', 'main.ts')],
      format: 'iife',
      outfile: path.join(dist, 'content', 'content.js'),
    }),
    esbuild.build({
      ...common,
      entryPoints: [path.join(src, 'settings', 'settings.ts')],
      format: 'iife',
      outfile: path.join(dist, 'settings', 'settings.js'),
    }),
  ]);

  console.log('Build complete: dist/');
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
