// Lists every English sentence the website translates: the literal arguments of t(...), the API fallback
// messages, and the label lists defined at module level (translated where shown). Writes them, sorted, to
// src/lib/i18n/keys.json (the source for messages/<code>.json; `npm run i18n:check` compares them).
// Usage: node scripts/i18n-keys.mjs
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SRC = path.resolve('src');
const SKIP = [
  /features[\\/]legal[\\/]pages[\\/]/,
  /LegalPage\.tsx$/,
  /\.test\.tsx?$/,
  /\.d\.ts$/,
  /lib[\\/]i18n[\\/]/,
];
// Module-level lists whose labels are translated where they are shown.
const LIST_FILES = [
  /cardMeta\.ts$/,
  /TravelLoader\.tsx$/,
  /FeatureList\.tsx$/,
  /HomePage\.tsx$/,
  /NotificationSettingsPage\.tsx$/,
  /DayCard\.tsx$/,
  /plans[\\/]options\.ts$/,
  /profile[\\/]pages[\\/]ProfilePage\.tsx$/,
  /WanderbookTabs\.tsx$/,
  /PeoplePage\.tsx$/,
  /wanderbook[\\/]types\.ts$/,
  /types[\\/]search\.ts$/,
  /validation\.ts$/,
  /UserProfilePage\.tsx$/,
  /VerifyEmailPage\.tsx$/,
  /ConfirmEmailPage\.tsx$/,
  /ForgotPasswordPage\.tsx$/,
  /ResetPasswordPage\.tsx$/,
  /GoogleSignInButton\.tsx$/,
  /useGoogleCode\.ts$/,
  /Service\.ts$/,
  /apiClient\.ts$/,
  /session\.ts$/,
];
// Built from parts at run time (book/format.ts plural).
const EXTRA = [
  '1 day',
  '{0} days',
  '1 passenger',
  '{0} passengers',
  '1 guest',
  '{0} guests',
  '1 room',
  '{0} rooms',
];
const NOT_TEXT =
  /^(openid email profile|\(prefers-reduced-motion: reduce\)|Missing #root element in index\.html\.|\.\/apiError|AbortError|Accept-Language|ArrowLeft|ArrowRight|Bearer \{0\}|Content-Type|DELETE|GET|POST|PUT|PATCH|GoAwayGo|use\w+ must be used inside .*)$/;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p) && !SKIP.some((r) => r.test(p))) files.push(p);
  }
})(SRC);

const keys = new Set(EXTRA);
const sentence = (s) =>
  /\p{L}{2,}/u.test(s) && !/^[a-z0-9_.:/|-]+$/.test(s) && !/^[a-z][a-zA-Z0-9]*$/.test(s);
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const isList = LIST_FILES.some((r) => r.test(file));
  const visit = (node) => {
    if (ts.isCallExpression(node) && node.expression.getText() === 't') {
      const arg = node.arguments[0];
      if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)))
        keys.add(arg.text);
    }
    if (ts.isPropertyAssignment(node) && node.name.getText() === 'fallbackError') {
      const v = node.initializer;
      if (ts.isStringLiteral(v)) keys.add(v.text);
      if (ts.isConditionalExpression(v)) {
        for (const b of [v.whenTrue, v.whenFalse]) if (ts.isStringLiteral(b)) keys.add(b.text);
      }
    }
    if (
      isList &&
      ts.isStringLiteral(node) &&
      sentence(node.text) &&
      !ts.isImportDeclaration(node.parent) &&
      !ts.isLiteralTypeNode(node.parent)
    ) {
      const p = node.parent;
      const prop = ts.isPropertyAssignment(p) ? p.name.getText() : '';
      if (
        !/^(to|value|id|icon|imageSrc|className|key|href)$/.test(prop) &&
        /[A-Z]|\s/.test(node.text)
      )
        keys.add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}
const sorted = [...keys]
  .filter((k) => !NOT_TEXT.test(k) && /\p{L}/u.test(k))
  .sort((a, b) => a.localeCompare(b));
fs.writeFileSync(
  path.join(SRC, 'lib', 'i18n', 'keys.json'),
  `${JSON.stringify(sorted, null, 2)}\n`,
);
console.log(`${String(sorted.length)} sentences`);
