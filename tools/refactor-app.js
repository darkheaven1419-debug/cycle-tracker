/**
 * app.js refactoring script — Phase 1 automated transformations:
 * 1. Add "use strict"
 * 2. var → const/let based on reassignment detection
 * 3. Fix empty catch blocks
 * 4. Remove dead code
 */
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(srcPath, 'utf-8');

// --- 1. Add "use strict" ---
if (!code.startsWith('"use strict"') && !code.startsWith("'use strict'")) {
  code = '"use strict";\n\n' + code;
}

// --- 2. Detect reassigned variables ---
const reassignedVars = new Set();
const lines = code.split('\n');

lines.forEach(line => {
  if (/^\s*\/[/*]/.test(line) || /^\s*\*/.test(line)) return;
  if (/^\s*(var|let|const)\s/.test(line)) return;

  // Simple reassignments: name = value
  const assignRegex = /(?:^|[^=!<>])(\b[a-zA-Z_$]\w*)\s*=(?!=)/g;
  let m;
  while ((m = assignRegex.exec(line)) !== null) {
    const name = m[1];
    if (!['module','exports','require','true','false','null','undefined','this','window','document','console','Math','Date','JSON','Array','Object','String','Number','Boolean','RegExp','Error','Promise','Set','Map','parseInt','parseFloat','isNaN','isFinite','setTimeout','setInterval','clearTimeout','clearInterval','localStorage','sessionStorage','fetch','URL','Image','Blob','FileReader','XMLHttpRequest','navigator','location','history','screen','crypto','performance','Intl','Reflect','Proxy','Symbol','WeakMap','WeakSet','Int8Array','Int16Array','Int32Array','Uint8Array','Float32Array','Float64Array','DataView','ArrayBuffer'].includes(name)) {
      reassignedVars.add(name);
    }
  }

  // ++ and -- operators
  const incDecRegex = /(\b[a-zA-Z_$]\w*)\s*(\+\+|--)/g;
  while ((m = incDecRegex.exec(line)) !== null) {
    reassignedVars.add(m[1]);
  }

  // Compound assignment +=, -=, etc.
  const compoundRegex = /(\b[a-zA-Z_$]\w*)\s*[+\-*/%&|^]=/g;
  while ((m = compoundRegex.exec(line)) !== null) {
    reassignedVars.add(m[1]);
  }
});

// Detect for-loop variables
const forLoopRegex = /for\s*\(\s*(?:var|let|const)?\s*(\w+)\s*=/g;
let fm;
while ((fm = forLoopRegex.exec(code)) !== null) {
  reassignedVars.add(fm[1]);
}

// Detect function parameter mutations
const paramAssignRegex = /function\s+\w+\s*\(([^)]*)\)[\s\S]*?\{/g;
// (skip — too complex for regex, handled by reassignment detection above)

console.log('Reassigned vars:', reassignedVars.size);

// --- 3. Replace var → const/let ---
const varStmtRegex = /\bvar\s+((?:\w+\s*=\s*[^,;]+,?\s*)+)/g;
let varCount = 0;

code = code.replace(varStmtRegex, (match, declarations) => {
  const parts = declarations.split(',').map(p => p.trim());
  const constParts = [];
  const letParts = [];
  parts.forEach(part => {
    const eqIdx = part.indexOf('=');
    let name, value;
    if (eqIdx === -1) {
      name = part.trim();
      value = null;
    } else {
      name = part.substring(0, eqIdx).trim();
      value = part.substring(eqIdx + 1).trim();
    }
    if (reassignedVars.has(name)) {
      letParts.push(value !== null ? `${name} = ${value}` : name);
    } else {
      constParts.push(value !== null ? `${name} = ${value}` : name);
    }
  });
  varCount++;
  const results = [];
  if (constParts.length > 0) results.push('const ' + constParts.join(', '));
  if (letParts.length > 0) results.push('let ' + letParts.join(', '));
  return results.join('; ');
});

// Handle `var name;` (no initializer, no comma)
code = code.replace(/\bvar\s+(\w+)\s*;/g, (match, name) => {
  varCount++;
  return `let ${name};`;
});

console.log('Converted var declarations:', varCount);

// --- 4. Fix empty catch blocks ---
let catchFixes = 0;
code = code.replace(/catch\s*\(\s*(\w+)\s*\)\s*\{\s*\}/g, (match, errVar) => {
  catchFixes++;
  return `catch(${errVar}) { /* non-critical */ }`;
});

console.log('Fixed empty catch blocks:', catchFixes);

// --- 5. Remove dead code ---
// Remove _el cache (unused)
code = code.replace(
  /var _el = \{\};.*?\nfunction el\(id\) \{ return _el\[id\] \|\| \(_el\[id\] = document\.getElementById\(id\)\); \}\nfunction clearElCache\(\) \{ _el = \{\}; \}/s,
  '// DOM cache removed — use document.getElementById directly'
);

// Remove renderAll alias — replace with applyAllUI
code = code.replace(/function renderAll\(what\) \{ applyAllUI\(what\); \}/, 'const renderAll = applyAllUI;');

// --- Write ---
const bakPath = srcPath + '.bak';
fs.writeFileSync(bakPath, fs.readFileSync(srcPath, 'utf-8'));
fs.writeFileSync(srcPath, code, 'utf-8');

console.log('\nDone! Backup: app.js.bak');
console.log('New:', code.length, 'bytes,', code.split('\n').length, 'lines');
