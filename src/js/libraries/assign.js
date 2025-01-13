const fs = require("fs");
const acorn = require("acorn");

/**
 * Parses a JavaScript file and extracts function and variable definitions.
 * @param {string} filePath - Path to the JavaScript file to analyze.
 * @returns {Object} - An object containing arrays of function and variable names.
 */
function parseJSFile(filePath) {
  try {
    // Read the JavaScript file
    const code = fs.readFileSync(filePath, "utf8");

    // Parse the JavaScript code into an AST with module support
    const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: "module" });

    const functions = [];
    const variables = [];

    // Recursively traverse the AST
    function traverse(node) {
      switch (node.type) {
        case "FunctionDeclaration":
          if (node.id) {
            functions.push(node.id.name);
          }
          break;

        case "VariableDeclaration":
          node.declarations.forEach((declaration) => {
            if (declaration.id && declaration.id.name) {
              variables.push(declaration.id.name);
            }
          });
          break;

        case "VariableDeclarator":
          if (
            node.init &&
            (node.init.type === "FunctionExpression" ||
              node.init.type === "ArrowFunctionExpression")
          ) {
            functions.push(node.id.name);
          }
          break;
      }

      // Traverse child nodes
      for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(traverse);
        } else if (child && typeof child.type === "string") {
          traverse(child);
        }
      }
    }

    traverse(ast);

    return { functions, variables };
  } catch (error) {
    throw new Error(`Error processing file: ${error.message}`);
  }
}

// Export the function to make it reusable
module.exports = { parseJSFile };