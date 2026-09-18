/**
 * Every shipped script must parse.
 *
 * Added after a Phase 1D edit inserted a property into the minified js/i18n.js
 * with a doubled comma (",,legend:"). That is a syntax error, so the whole file
 * failed to evaluate, `t` was never defined, and eleven suites went red with
 * "Unexpected token ','" / "t is not defined" — reported as twelve unrelated
 * failures across panels that had nothing to do with the edit. The behavioural
 * suites do catch it, but they catch it as noise; this names the file.
 *
 * Parsing is the weakest possible check and that is the point: it is the one
 * assertion that can never be a false positive, and it runs in milliseconds.
 * index.html is minified onto a single line, which is exactly the shape that
 * makes a stray comma invisible in review, so its inline scripts are checked
 * too.
 *
 * Run: node tests/test-runtime-parse.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/** Parse-only. Throws a SyntaxError with the filename and line attached. */
function parses(src, label) {
  try {
    new vm.Script(src, { filename: label });
    return null;
  } catch (e) {
    return e.message;
  }
}

/** Every classic script the browser loads, source and dist mirror alike. */
function shippedScripts() {
  const out = ['app.js', 'sw.js'];
  fs.readdirSync(path.join(ROOT, 'js'))
    .filter((f) => f.endsWith('.js'))
    .sort()
    .forEach((f) => out.push('js/' + f));
  const mirrors = ['dist/app.js', 'dist/sw.js'];
  const distJs = path.join(ROOT, 'dist', 'js');
  if (fs.existsSync(distJs)) {
    fs.readdirSync(distJs)
      .filter((f) => f.endsWith('.js'))
      .sort()
      .forEach((f) => mirrors.push('dist/js/' + f));
  }
  return out.concat(mirrors.filter((f) => fs.existsSync(path.join(ROOT, f))));
}

/**
 * Inline script bodies (no src=) from a minified page. Splitting on the closing
 * tag and walking back to the opening one avoids regex escaping entirely, which
 * matters here: this file is written through a shell heredoc, and every
 * escaping layer between here and disk eats one backslash.
 */
function inlineScripts(html) {
  const out = [];
  const chunks = html.split('</script>');
  chunks.forEach((chunk, i) => {
    if (i === chunks.length - 1) return; // text after the final close tag
    const at = chunk.lastIndexOf('<script');
    if (at === -1) return;
    const gt = chunk.indexOf('>', at);
    if (gt === -1) return;
    const head = chunk.slice(at, gt).toLowerCase();
    if (head.indexOf('src=') !== -1) return; // external file, handled above
    // Only real scripts. JSON-LD blocks are not JavaScript statements.
    if (head.indexOf('type=') !== -1 &&
        head.indexOf('javascript') === -1 &&
        head.indexOf('module') === -1) return;
    out.push(chunk.slice(gt + 1));
  });
  return out;
}

// ── A. every shipped classic script parses ──
{
  const files = shippedScripts();
  const broken = [];
  files.forEach((f) => {
    const err = parses(fs.readFileSync(path.join(ROOT, f), 'utf8'), f);
    if (err) broken.push(f + ': ' + err.split('\n')[0]);
  });
  check('P1 every shipped classic script parses, source and dist alike',
    broken.length === 0 && files.length > 30,
    `files=${files.length} broken=${broken.join(' | ') || 'none'}`);
}

// ── B. and so does every inline script in the minified page ──
{
  const pages = ['index.html', 'dist/index.html'].filter((f) => fs.existsSync(path.join(ROOT, f)));
  const broken = [];
  let total = 0;
  pages.forEach((p) => {
    const bodies = inlineScripts(fs.readFileSync(path.join(ROOT, p), 'utf8'));
    total += bodies.length;
    bodies.forEach((body, i) => {
      const err = parses(body, p + ' inline#' + (i + 1));
      if (err) broken.push(p + ' inline#' + (i + 1) + ': ' + err.split('\n')[0]);
    });
  });
  check('P2 every inline script in index.html parses',
    broken.length === 0 && total > 0,
    `blocks=${total} broken=${broken.join(' | ') || 'none'}`);
}

// ── C. the guard is not vacuous: a doubled comma really is a syntax error ──
{
  const control = 'const a = {x:1,,y:2};';
  const err = parses(control, 'control');
  check('P3 control: the corruption that motivated this test is detected',
    err !== null, `controlError=${err ? err.split('\n')[0] : 'none'}`);
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
