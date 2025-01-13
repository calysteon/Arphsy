const fs = require("fs");
const acorn = require("acorn");
const { parseJSFile } = require("./libraries/assign"); // Import the parseJSFile function

/**
 * Filters functions that only use defined variables and functions.
 * @param {string} filePath - Path to the JavaScript file to analyze.
 * @returns {string[]} - An array of valid function definitions.
 */
function filterFunctions(filePath) {
  try {
    const { functions: definedFunctions, variables: definedVariables } = parseJSFile(filePath);

    // Read the file content
    const code = fs.readFileSync(filePath, "utf8");

    // Parse the code into an AST
    const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: "module" });

    const validFunctions = [];

    // Helper function to check if an identifier is valid
    function isValidIdentifier(name) {
      return definedFunctions.includes(name) || definedVariables.includes(name);
    }

    // Traverse the AST to find function definitions
    function traverse(node) {
      if (node.type === "FunctionDeclaration" && node.body) {
        const functionName = node.id.name;
        const isValid = checkFunctionBody(node.body);

        if (isValid) {
          // Capture the source code of the function
          const functionCode = code.slice(node.start, node.end);
          validFunctions.push(functionCode);
        }
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

    // Check if a function body only uses valid identifiers
    function checkFunctionBody(bodyNode) {
      let isValid = true;

      function validateNode(node) {
        if (node.type === "Identifier") {
          if (!isValidIdentifier(node.name)) {
            isValid = false;
          }
        }

        // Traverse child nodes
        for (const key in node) {
          const child = node[key];
          if (Array.isArray(child)) {
            child.forEach(validateNode);
          } else if (child && typeof child.type === "string") {
            validateNode(child);
          }
        }
      }

      validateNode(bodyNode);
      return isValid;
    }

    traverse(ast);

    return validFunctions;
  } catch (error) {
    throw new Error(`Error processing file: ${error.message}`);
  }
}

// Get file path and output path from command-line arguments
const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
  console.error("Usage: node filterFunctions.js <inputFilePath> <outputFilePath>");
  process.exit(1);
}

// Find valid functions
try {
  const validFunctions = filterFunctions(inputFilePath);

  if (validFunctions.length > 0) {
    // Wrap the valid functions in a JavaScript block
    const formattedCode = `\n${validFunctions.join("\n\n")}\n`;

    // Append the valid functions to the output file
    fs.appendFileSync(outputFilePath, formattedCode, "utf8");
    console.log(`Valid functions have been appended to ${outputFilePath}`);
  } else {
    console.log("No valid functions found.");
  }
} catch (error) {
  console.error(error.message);
}
