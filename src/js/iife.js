const fs = require("fs");
const acorn = require("acorn");

/**
 * Finds all Immediately Invoked Function Expressions (IIFEs) in a JavaScript file.
 * @param {string} filePath - Path to the JavaScript file.
 * @returns {string[]} - Array of IIFE source code snippets.
 */
function findIIFEs(filePath) {
  try {
    // Read the JavaScript file
    const jsCode = fs.readFileSync(filePath, "utf8");

    // Parse the JavaScript code into an AST
    const ast = acorn.parse(jsCode, { ecmaVersion: 2020, sourceType: "module" });

    const iifes = [];

    // Recursively traverse the AST
    function traverse(node) {
      if (
        node.type === "CallExpression" &&
        (node.callee.type === "FunctionExpression" ||
          node.callee.type === "ArrowFunctionExpression")
      ) {
        // Adjust start and end to include parentheses and trailing semicolon
        const before = jsCode[node.start - 1] === "(" ? node.start - 1 : node.start;
        const after = jsCode[node.end] === ";" ? node.end + 1 : (jsCode[node.end] === ")" ? node.end + 1 : node.end);

        // Capture the source code of the IIFE including parentheses and semicolon
        const iifeCode = jsCode.slice(before, after).trim();
        iifes.push(iifeCode);
      }

      // Traverse child nodes
      for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach((n) => traverse(n));
        } else if (child && typeof child.type === "string") {
          traverse(child);
        }
      }
    }

    // Start traversing from the root node
    traverse(ast);

    return iifes;
  } catch (error) {
    console.error("Error processing file:", error.message);
    process.exit(1);
  }
}

// Get file path and output path from command-line arguments
const filePath = process.argv[2];
const outputPath = process.argv[3];

if (!filePath || !outputPath) {
  console.error("Usage: node findIIFEs.js <inputFilePath> <outputFilePath>");
  process.exit(1);
}

// Find IIFEs
const iifes = findIIFEs(filePath);

// Write the valid JavaScript IIFEs to the output file
try {
  if (iifes.length > 0) {
    const formattedCode = `\n${iifes.join("\n\n")}\n`;
    fs.writeFileSync(outputPath, formattedCode, "utf8");
    console.log(`IIFEs have been written to ${outputPath}`);
  } else {
    console.log("No IIFEs found.");
  }
} catch (error) {
  console.error("Error writing to file:", error.message);
  process.exit(1);
}
