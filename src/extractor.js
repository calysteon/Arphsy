const fs = require("fs");
const acorn = require("acorn"); 
const path = require('path');

function findMostReassignedVariable(filePath) {
    
    // Read the file content
    const sourceCode = fs.readFileSync(filePath, "utf8");

    const ast = acorn.parse(sourceCode, {
        ecmaVersion: "latest",
        sourceType: "module", // Treat as ES module to allow import.meta
    });
    const variableReassignmentCounts = {};

    // Helper function to count occurrences of variable references
    function countVariableReference(name) {
        if (!variableReassignmentCounts[name]) {
            variableReassignmentCounts[name] = 0;
        }
        variableReassignmentCounts[name]++;
    }

    // Traverse AST to find assignments
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

    // Find the variable with the highest count
    const mostReassigned = Object.entries(variableReassignmentCounts).reduce(
        (max, [name, count]) => (count > max.count ? { name, count } : max),
        { name: null, count: 0 }
    );

    return mostReassigned;
}

function findAssignedValue(result, filePath) {
    if (typeof result.name === 'undefined') {
        console.log(`${result.name} is undefined.`);
        return null;
    }

    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Build a regex to locate the assignment
    const variableName = result.name;
    const regex = new RegExp(`\\b${variableName}\\b\\s*=\\s*([^;]+);`, 'g');

    // Search for matches
    const match = regex.exec(fileContent);

    if (match && match[1]) {
        const assignedValue = match[1].trim();
        console.log(`Value assigned to ${variableName}:`, assignedValue);
        return assignedValue;
    } else {
        console.log(`No assignment found for '${variableName}' in the file.`);
        return null;
    }
}

function extractFunctionBody(functionName, filePath, fileOutPath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Regex to match the function definition
    const functionRegex = new RegExp(
        `function\\s+${functionName}\\s*\\(.*?\\)\\s*{[^}]*}[^}]*`,
        'gs'
    );
    const match = functionRegex.exec(fileContent);

    if (match) {
        let functionBody = match[0];

        // Add export statement to make the function importable
        functionBody += `\n\nmodule.exports = { ${functionName} };`;

        // Write the function with export to the output file
        fs.writeFileSync(fileOutPath, functionBody, 'utf-8');
        console.log(`Function extracted and written to ${fileOutPath}`);
        return functionBody;
    } else {
        console.error(`Function definition for '${functionName}' not found in ${filePath}`);
        return null;
    }
}

// Get command-line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error("Usage: node extractor.js <filePath> <fileOutPath>");
    process.exit(1);
}

// Extract filePath and fileOutPath from arguments
const filePath = args[0];
const fileOutPath = args[1];

console.log(`Input file: ${filePath}`);
console.log(`Output file: ${fileOutPath}`);

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const result = findMostReassignedVariable(filePath);
console.log(`Most reassigned variable: ${result.name} (${result.count} reassignments)`);

if (typeof result.name === 'function') {
    console.log(`${result.name} is a function`);
} else if (typeof result.name !== 'undefined') {
    console.log(`${result.name} is a variable`);
    const assignedValue = findAssignedValue(result, filePath);
    if (assignedValue) {
        console.log(`Assigned value: ${assignedValue}`);
        const functionBody = extractFunctionBody(assignedValue, filePath, fileOutPath);
        if (functionBody) {
            console.log(`Extracted function:\n${functionBody}`);
        }
    } else {
        console.error('No assigned value found.');
    }
} else {
    console.log(`${result.name} is neither a variable nor a function`);
}
