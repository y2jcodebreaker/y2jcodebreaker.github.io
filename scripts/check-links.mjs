import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const failures = [];

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(full);
    return e.name.endsWith('.html') ? [full] : [];
  });
}

for (const file of htmlFiles(DIST)) {
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);

  for (const href of hrefs) {
    if (!href.startsWith('/')) continue;          // external and anchors: skip
    if (href.startsWith('//')) continue;          // protocol-relative
    const clean = href.split('#')[0].split('?')[0];
    if (clean === '' || clean === '/') continue;

    const candidates = [
      path.join(DIST, clean),
      path.join(DIST, clean, 'index.html'),
      path.join(DIST, `${clean}.html`),
    ];
    if (!candidates.some((c) => fs.existsSync(c))) {
      failures.push(`${file}: dead internal link -> ${href}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Dead links found:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('All internal links resolve.');
