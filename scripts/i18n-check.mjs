// Fails if a sentence the website shows has no translation (4.7): re-collects the sentences (scripts/i18n-keys.mjs
// writes src/lib/i18n/keys.json), then checks every messages/<code>.json has each one with the same placeholders.
// Usage: node scripts/i18n-check.mjs (part of `npm run check`)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

execFileSync(process.execPath, [path.resolve('scripts/i18n-keys.mjs')], { stdio: 'inherit' });
const dir = path.resolve('src/lib/i18n');
const keys = JSON.parse(fs.readFileSync(path.join(dir, 'keys.json'), 'utf8'));
const problems = [];
for (const file of fs.readdirSync(path.join(dir, 'messages'))) {
  const messages = JSON.parse(fs.readFileSync(path.join(dir, 'messages', file), 'utf8'));
  for (const key of keys) {
    const text = messages[key];
    if (typeof text !== 'string' || text.length === 0) {
      problems.push(`${file}: missing "${key}"`);
      continue;
    }
    for (const placeholder of key.match(/\{\d\}/g) ?? []) {
      if (!text.includes(placeholder)) problems.push(`${file}: "${key}" lost ${placeholder}`);
    }
  }
}
if (problems.length > 0) {
  console.error(`${String(problems.length)} translation problems:\n${problems.join('\n')}`);
  console.error('Add the sentences to every src/lib/i18n/messages/<code>.json.');
  process.exit(1);
}
console.log('Every sentence is translated.');
