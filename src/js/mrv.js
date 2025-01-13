const fs = require("fs");
const path = require("path");
const { findMostReassignedVariable } = require("./libraries/reassign"); // Import the function

/**
 * Finds the function definition referenced by a variable.
 * @param {string} filePath - Path to the JavaScript file to analyze.
 * @param {string} varName - Name of the variable to locate.
 * @returns {string|null} - The full function definition, or null if not found.
 */
function findFunctionDefinition(filePath, varName) {
  try {
    // Read the file content
    const sourceCode = fs.readFileSync(filePath, "utf8");

    // Parse the JavaScript code into an AST
    const ast = require("acorn").parse(sourceCode, {
      ecmaVersion: "latest",
      sourceType: "module",
    });

    let functionDefinition = null;

    // Traverse the AST to locate the variable and its function definition
    function traverse(node) {
      if (!node) return;

      // Check if the variable references a function
      if (
        node.type === "VariableDeclarator" &&
        node.id.name === varName &&
        node.init &&
        (node.init.type === "FunctionExpression" || node.init.type === "ArrowFunctionExpression")
      ) {
        functionDefinition = sourceCode.slice(node.start, node.end);
      }

      if (node.type === "FunctionDeclaration" && node.id.name === varName) {
        functionDefinition = sourceCode.slice(node.start, node.end);
      }

      // Traverse child nodes
      for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(traverse);
        } else if (child && typeof child === "object") {
          traverse(child);
        }
      }
    }

    traverse(ast);
    return functionDefinition;
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    return null;
  }
}

// Command-line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node findFunctionDefinitionCLI.js <inputFilePath> <outputFilePath>");
  process.exit(1);
}

const inputFilePath = args[0];
const outputFilePath = args[1];

if (!fs.existsSync(inputFilePath)) {
  console.error(`Input file not found: ${inputFilePath}`);
  process.exit(1);
}

// Find the most reassigned variable
const result = findMostReassignedVariable(inputFilePath);

if (!result.name) {
  console.log("No reassigned variables found.");
  process.exit(0);
}

console.log(`Most reassigned variable: ${result.name} (${result.count} reassignments)`);

// Find the function definition
const functionDefinition = findFunctionDefinition(inputFilePath, result.name);

if (functionDefinition) {
  console.log("Function definition:");
  console.log(functionDefinition);

  // Append the function definition and export statement to the output file
  try {
    fs.appendFileSync(outputFilePath, `\n ${functionDefinition}\n`, "utf8");
    fs.appendFileSync(outputFilePath, `\nexport { ${result.name} };\n`, "utf8");
    console.log(`Function definition and export statement appended to: ${outputFilePath}`);
  } catch (error) {
    console.error(`Error writing to file: ${error.message}`);
  }
} else {
  console.log(`No function definition found for variable: ${result.name}`);
}
