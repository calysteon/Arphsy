#!/usr/bin/env node
/**
 * clean.js
 *
 * (1) Drop any function whose name exists in VERIFIED_FILE_JS.
 * (2) Delete IIFEs at the top level.
 * (3) Delete functions never referenced *or* clearly unimplemented.
 */

const fs       = require('fs');
const parser   = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t        = require('@babel/types');
const generate = require('@babel/generator').default;

// ---------------------------------------------------------------------------
// 0. CLI
// ---------------------------------------------------------------------------
const [extractedPath, verifiedPath] = process.argv.slice(2);
if (!extractedPath || !verifiedPath) {
  console.error('Usage: node clean-extracted.js <EXTRACTED_FILE_JS> <VERIFIED_FILE_JS>');
  process.exit(1);
}
const extractedSrc = fs.readFileSync(extractedPath, 'utf8');
const verifiedSrc  = fs.readFileSync(verifiedPath, 'utf8');
const PARSE_OPTS   = { sourceType: 'module', plugins: ['jsx', 'typescript'] };

// ---------------------------------------------------------------------------
// 1.  Collect function names from VERIFIED
// ---------------------------------------------------------------------------
const verifiedAst   = parser.parse(verifiedSrc, PARSE_OPTS);
const verifiedNames = new Set();

traverse(verifiedAst, {
  FunctionDeclaration(p) {
    if (p.node.id) verifiedNames.add(p.node.id.name);
  },
  VariableDeclarator(p) {
    if (t.isIdentifier(p.node.id) && t.isFunction(p.node.init))
      verifiedNames.add(p.node.id.name);
  }
});

// ---------------------------------------------------------------------------
// 2.  Parse EXTRACTED and run Pass 1 + Pass 2 simultaneously
//     (we can delete duplicated functions and IIFEs in one walk)
// ---------------------------------------------------------------------------
const extractedAst = parser.parse(extractedSrc, PARSE_OPTS);

traverse(extractedAst, {
  enter(p) {
    // ------------- Pass 1 — duplicated functions --------------------------
    if (p.isFunctionDeclaration() && p.node.id &&
        verifiedNames.has(p.node.id.name)) {
      p.remove();
      return;
    }
    if (p.isVariableDeclarator() &&
        t.isIdentifier(p.node.id) &&
        t.isFunction(p.node.init) &&
        verifiedNames.has(p.node.id.name)) {
      p.remove();
      return;
    }

    // ------------- Pass 2 — IIFEs ----------------------------------------
    //  Match: top‑level ExpressionStatement   (function(){…})()   or  (()=>{…})()
    if (p.isExpressionStatement() &&
        t.isCallExpression(p.node.expression) &&
        (
          t.isFunctionExpression(p.node.expression.callee) ||
          t.isArrowFunctionExpression(p.node.expression.callee) ||
          t.isFunctionExpression(
            p.node.expression.callee.type === 'SequenceExpression'
              ? p.node.expression.callee.expressions.slice(-1)[0]
              : null
          ) // handles weird "(0, function(){})()" patterns
        )) {
      p.remove();
    }
  }
});

// ---------------------------------------------------------------------------
// 3.  Pass 3 — remove unreferenced OR “not implemented” functions
// ---------------------------------------------------------------------------
const declared = new Map(); // name → path
const used     = new Set();

traverse(extractedAst, {
  // Capture declarations ----------------------------------------------------
  FunctionDeclaration(p) {
    if (p.node.id) declared.set(p.node.id.name, p);
  },
  VariableDeclarator(p) {
    if (t.isIdentifier(p.node.id) && t.isFunction(p.node.init)) {
      declared.set(p.node.id.name, p);
    }
  },

  // Capture non‑declaration identifier uses ---------------------------------
  Identifier(p) {
    if (
      (p.parent.type === 'FunctionDeclaration' && p.key === 'id') ||
      (p.parent.type === 'VariableDeclarator'  && p.key === 'id') ||
      (p.parent.type === 'MemberExpression'    && p.parent.property === p.node && !p.parent.computed)
    ) return; // declaration site or property name

    used.add(p.node.name);
  }
});

// Helpers to decide “not implemented”
function isClearlyUnimplemented(fnNode) {
  if (!fnNode.body || fnNode.body.type !== 'BlockStatement') return false;
  const stmts = fnNode.body.body;
  if (stmts.length === 0) return true;                    // empty {}
  if (stmts.length === 1) {
    const s = stmts[0];
    if (t.isReturnStatement(s) && s.argument == null) return true; // "return;"
    if (t.isThrowStatement(s) && t.isStringLiteral(s.argument) &&
        /not\s+implemented|todo/i.test(s.argument.value)) return true;
  }
  return false;
}

// Remove the dead / stub declarations
for (const [name, path] of declared) {
  const fnNode = path.isFunctionDeclaration() ? path.node
                 : t.isFunction(path.node.init) ? path.node.init
                 : null;
  const unused           = !used.has(name);
  const unimplemented    = fnNode && isClearlyUnimplemented(fnNode);
  if (unused || unimplemented) path.remove();
}

// ---------------------------------------------------------------------------
// 4.  Emit
// ---------------------------------------------------------------------------
const outFile = 'sample/out.js';
fs.writeFileSync(outFile, generate(extractedAst, { retainLines: false }).code, 'utf8');
console.log(`Cleaned file saved to ${outFile}`);
