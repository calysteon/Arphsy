const fs = require("fs");
const acorn = require("acorn");

/**
 * Finds the most reassigned variable in a JavaScript file.
 * @param {string} filePath - Path to the JavaScript file to analyze.
 * @returns {Object} - An object containing the variable name and count of reassignments.
 */
function findMostReassignedVariable(filePath) {
  // Read the file content
  const sourceCode = fs.readFileSync(filePath, "utf8");

  // Parse the JavaScript code into an AST
  const ast = acorn.parse(sourceCode, {
    ecmaVersion: "latest",
    sourceType: "module", // Treat as ES module
  });

  const variableReassignmentCounts = {};

  // Helper function to count occurrences of variable references
  function countVariableReference(name) {
    if (!variableReassignmentCounts[name]) {
      variableReassignmentCounts[name] = 0;
    }
    variableReassignmentCounts[name]++;
  }

  // Traverse the AST to find variable reassignments
  function traverse(node) {
    if (!node) return;

    switch (node.type) {
      case "VariableDeclarator":
        // Check if the initializer is a variable
        if (node.init && node.init.type === "Identifier") {
          countVariableReference(node.init.name);
        }
        break;

      case "AssignmentExpression":
        // Check if the right-hand side is a variable
        if (node.right && node.right.type === "Identifier") {
          countVariableReference(node.right.name);
        }
        break;

      default:
        // Traverse child nodes recursively
        for (const key in node) {
          const child = node[key];
          if (Array.isArray(child)) {
            child.forEach(traverse);
          } else if (child && typeof child === "object") {
            traverse(child);
          }
        }
    }
  }

  traverse(ast);

  // Find the variable with the highest reassignment count
  const mostReassigned = Object.entries(variableReassignmentCounts).reduce(
    (max, [name, count]) => (count > max.count ? { name, count } : max),
    { name: null, count: 0 }
  );

  return mostReassigned;
}

// Export the function for use in other modules
module.exports = { findMostReassignedVariable };
