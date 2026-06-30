/**
 * Anđelin Ciklus — Production Build Script
 *
 * 1. Concatenates & minifies CSS
 * 2. Copies & minifies HTML
 * 3. Copies JS and data files
 * 4. Updates version references in the built files
 * 5. Outputs to dist/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = 'v' + PKG.version;

const COPY_DIRS = ['js', 'data', 'libs']; // libs/ contains gsap.min.js + ScrollTrigger.min.js
const COPY_FILES = [
  // index.html is handled separately (minified by html-minifier)
  'app.js',
  'styles.css',
  'manifest.json',
  'sw.js',
  'calendar-data.json',
  'shared-diary.json',
  'shared-state.json',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'offline.html',
];

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

function banner(msg) {
  console.info('\n  ' + '='.repeat(50));
  console.info('  ' + msg);
  console.info('  ' + '='.repeat(50));
}

function rmRf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function cp(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// ---------------------------------------------------------------------------
//  Clean
// ---------------------------------------------------------------------------

banner('CLEAN');
rmRf(DIST);
fs.mkdirSync(DIST);
console.info('  dist/ cleaned');

// ---------------------------------------------------------------------------
//  CSS — concatenate & minify
// ---------------------------------------------------------------------------

banner('CSS');

const cssDir = path.join(ROOT, 'css');
const singleCssPath = path.join(ROOT, 'styles.css');

let cssContent = '';

if (fs.existsSync(cssDir)) {
  // Multiple CSS files in css/ directory
  const cssFiles = fs
    .readdirSync(cssDir)
    .filter((f) => f.endsWith('.css'))
    .sort();

  if (cssFiles.length > 0) {
    cssContent = cssFiles
      .map((f) => {
        const p = path.join(cssDir, f);
        return fs.readFileSync(p, 'utf8');
      })
      .join('\n');
  }
}

if (!cssContent && fs.existsSync(singleCssPath)) {
  // Single styles.css at root
  cssContent = fs.readFileSync(singleCssPath, 'utf8');
}

if (cssContent) {
  // Replace version references in CSS before minifying
  cssContent = cssContent.replace(/v\d+(?:\.\d+)?/g, VERSION);

  // Write concatenated (unminified) for reference
  const concatPath = path.join(DIST, 'styles.css');
  fs.writeFileSync(concatPath, cssContent, 'utf8');

  // Minify with clean-css
  const inputPath = path.join(ROOT, '_build_styles.css');
  const outputPath = path.join(DIST, 'styles.min.css');
  fs.writeFileSync(inputPath, cssContent, 'utf8');

  try {
    execSync(`npx cleancss --source-map -o "${outputPath}" "${inputPath}"`, { cwd: ROOT, stdio: 'pipe' });
    const origSize = (Buffer.byteLength(cssContent, 'utf8') / 1024).toFixed(1);
    const minSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.info(`  styles.css  (${origSize} KB → ${minSize} KB minified)`);
  } catch (err) {
    console.warn('  WARN: clean-css minification failed, using unminified');
    cp(concatPath, outputPath);
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  }
} else {
  console.info('  No CSS files found, skipping');
}

// ---------------------------------------------------------------------------
//  HTML — copy & minify
// ---------------------------------------------------------------------------

banner('HTML');

const htmlSrc = path.join(ROOT, 'index.html');
if (fs.existsSync(htmlSrc)) {
  let html = fs.readFileSync(htmlSrc, 'utf8');

  // Update version references in HTML
  html = html.replace(/v\d+(?:\.\d+)?/g, VERSION);

  // Production optimization: replace all individual CSS <link> tags
  // with a single link to the concatenated+minified styles.min.css
  let cssMatchCount = (html.match(/<link rel="stylesheet" href="css\/[^"]+">/g) || []).length;
  html = html.replace(/(?:\s*<link rel="stylesheet" href="css\/[^"]+">)+/, '\n<link rel="stylesheet" href="styles.min.css">');
  console.info('  CSS links: ' + cssMatchCount + ' → ' + (html.match(/styles\.min\.css/g) || []).length + ' (prod bundle)');

  // Write unminified copy
  fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');

  // Minify
  let inputHtml;
  try {
    inputHtml = path.join(ROOT, '_build_index.html');
    fs.writeFileSync(inputHtml, html, 'utf8');

    execSync(
      `npx html-minifier --collapse-whitespace --remove-comments ` +
        `--remove-optional-tags --remove-redundant-attributes ` +
        `--remove-script-type-attributes --remove-tag-whitespace ` +
        `--use-short-doctype --minify-css true --minify-js true ` +
        `-o "${path.join(DIST, 'index.html')}" "${inputHtml}"`,
      { cwd: ROOT, stdio: 'pipe' }
    );

    const origSize = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
    const minSize = (fs.statSync(path.join(DIST, 'index.html')).size / 1024).toFixed(1);
    console.info(`  index.html  (${origSize} KB → ${minSize} KB)`);
  } catch (err) {
    console.warn('  WARN: html-minifier failed, using unminified copy');
  } finally {
    if (fs.existsSync(inputHtml)) fs.unlinkSync(inputHtml);
  }
} else {
  console.info('  No index.html found, skipping');
}

// ---------------------------------------------------------------------------
//  JS — minify with terser, then create optimized bundles
// ---------------------------------------------------------------------------

banner('JS');

const terserAvailable = (function () {
  try {
    require.resolve('terser');
    return true;
  } catch (e) {
    return false;
  }
})();

if (terserAvailable) {
  const Terser = require('terser');

  COPY_DIRS.forEach((dir) => {
    const srcDir = path.join(ROOT, dir);
    if (!fs.existsSync(srcDir)) return;

    const destDir = path.join(DIST, dir);
    fs.mkdirSync(destDir, { recursive: true });

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    entries.forEach((entry) => {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        cp(srcPath, destPath);
      } else {
        let content = fs.readFileSync(srcPath, 'utf8');
        content = content.replace(/v\d+(?:\.\d+)?/g, VERSION);
        if (entry.name.endsWith('.min.js')) {
          fs.writeFileSync(destPath, content, 'utf8');
        } else {
          Terser.minify(content, {
            compress: { passes: 2, drop_console: false },
            mangle: { reserved: ['Lunar', 'AuthModule', 'ChartRenderer', 'CultureCardsModule', 'syncDiaryData'] },
            output: { comments: false },
          })
            .then(function (result) {
              if (result.code) {
                fs.writeFileSync(destPath, result.code, 'utf8');
              } else {
                fs.writeFileSync(destPath, content, 'utf8');
              }
            })
            .catch(function () {
              fs.writeFileSync(destPath, content, 'utf8');
            });
        }
      }
    });

    const count = entries.filter((e) => e.isFile()).length;
    if (count > 0) console.info('  ' + dir + '/  (' + count + ' files, terser minified)');
  });
} else {
  console.info('  terser not available — copying JS without minification');
  console.info('  Run: npm install');

  COPY_DIRS.forEach((dir) => {
    const srcDir = path.join(ROOT, dir);
    if (!fs.existsSync(srcDir)) return;
    const destDir = path.join(DIST, dir);
    fs.mkdirSync(destDir, { recursive: true });
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    entries.forEach(function (entry) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        cp(srcPath, destPath);
        return;
      }
      let content = fs.readFileSync(srcPath, 'utf8');
      content = content.replace(/v\d+(?:\.\d+)?/g, VERSION);
      fs.writeFileSync(destPath, content, 'utf8');
    });
    const cnt = entries.filter(function (e) {
      return e.isFile();
    }).length;
    if (cnt > 0) console.info('  ' + dir + '/  (' + cnt + ' files)');
  });
}

// ---------------------------------------------------------------------------
//  Root files — copy
// ---------------------------------------------------------------------------

banner('ROOT FILES');

COPY_FILES.forEach((file) => {
  const srcPath = path.join(ROOT, file);
  if (!fs.existsSync(srcPath)) return;

  let content = fs.readFileSync(srcPath, 'utf8');
  content = content.replace(/v\d+(?:\.\d+)?/g, VERSION);
  fs.writeFileSync(path.join(DIST, file), content, 'utf8');
  console.info('  ' + file);
});

// ---------------------------------------------------------------------------
//  Version stamp
// ---------------------------------------------------------------------------

banner('VERSION');

const versionInfo = {
  version: PKG.version,
  buildTime: new Date().toISOString(),
  name: PKG.name,
};

const versionPath = path.join(DIST, 'version.json');
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2) + '\n', 'utf8');
console.info(`  version.json  → ${PKG.version} (${versionInfo.buildTime})`);

// ---------------------------------------------------------------------------
//  Summary
// ---------------------------------------------------------------------------

banner('BUILD COMPLETE');

let totalSize = 0;
let fileCount = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else {
      totalSize += fs.statSync(fullPath).size;
      fileCount++;
    }
  });
}

walk(DIST);

const totalKb = (totalSize / 1024).toFixed(1);
console.info(`  ${fileCount} files, ${totalKb} KB total`);
console.info(`  Output: ${DIST}\n`);
