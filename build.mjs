// Inlines src/ into a single index.html that opens straight from the file system.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(join(root, 'src', f), 'utf8');
const ORDER = ['data.jsx', 'kit.jsx', 'web.jsx', 'kyc.jsx', 'sanction.jsx', 'property.jsx', 'close.jsx', 'app.jsx'];

const html = readFileSync(join(root, 'template.html'), 'utf8')
  .replace('/*__STYLES__*/', () => src('styles.css'))
  .replace('/*__SCRIPTS__*/', () => ORDER.map((f) => `/* ── ${f} ── */\n${src(f)}`).join('\n'));

writeFileSync(join(root, 'index.html'), html);
console.log(`index.html written · ${(html.length / 1024).toFixed(0)} KB`);
