const fs = require('fs');
const path = require('path');

// Helper function to extract function calls from code
function extractFunctionCalls(code) {
    const regex = /\b([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/g;
    const calls = new Set();
    let match;
    while ((match = regex.exec(code)) !== null) {
        calls.add(match[1]);
    }
    return Array.from(calls);
}

// Helper function to extract function definitions from code
function extractFunctionDefinitions(code) {
    const regex = /\bfunction\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/g;
    const definitions = new Set();
    let match;
    while ((match = regex.exec(code)) !== null) {
        definitions.add(match[1]);
    }
    return definitions;
}

// Function to find self-executing autonomous functions using specific parameters
function findSelfExecutingFunctions(code, targetFunction) {
    const regex = new RegExp(
        `\\(\\s*function\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\b${targetFunction}\\b[\\s\\S]*?\\}\\s*\\([^)]*\\)\\s*;?`,
        'g'
    );
    const matches = [];
    let match;

    while ((match = regex.exec(code)) !== null) {
        matches.push(match[0]);
    }

    return matches;
}

// Function to resolve missing functions and prepend their definitions and associated IIFEs
function resolveExternalFunctionsAndIIFEs(mainFilePath, lookupFilePath) {
    // Read the main file
    const mainFileContent = fs.readFileSync(mainFilePath, 'utf-8');

    // Extract function calls and definitions from the main file
    const calledFunctions = extractFunctionCalls(mainFileContent);
    const definedFunctions = extractFunctionDefinitions(mainFileContent);

    // Identify externally referenced functions
    const missingFunctions = calledFunctions.filter(
        (func) => !definedFunctions.has(func)
    );

    if (missingFunctions.length === 0) {
        console.log('All functions are defined in the main file.');
        return;
    }

    console.log('Missing functions:', missingFunctions);

    // Read the lookup file
    const lookupFileContent = fs.readFileSync(lookupFilePath, 'utf-8');

    // Iterate through each missing function
    let updatedContent = mainFileContent;
    for (const missingFunction of missingFunctions) {
        console.log(`Resolving function: ${missingFunction}`);

        // Search for the function definition in the lookup file
        const functionRegex = new RegExp(
            `\\bfunction\\s+${missingFunction}\\s*\\(.*?\\{[\\s\\S]*?\\}`,
            'g'
        );
        const functionMatch = functionRegex.exec(lookupFileContent);

        if (!functionMatch) {
            console.log(`Definition for ${missingFunction} not found.`);
            continue;
        }

        const functionDefinition = functionMatch[0];
        console.log(`Found definition for ${missingFunction}`);

        // Prepend the function definition to the updated content
        updatedContent = functionDefinition + '\n\n' + updatedContent;

        // Search for self-executing functions using the resolved function
        const iifes = findSelfExecutingFunctions(lookupFileContent, missingFunction);
        if (iifes.length > 0) {
            console.log(`Found ${iifes.length} IIFE(s) using ${missingFunction}`);
            updatedContent = iifes.join('\n\n') + '\n\n' + updatedContent;
        }
    }

    // Write the updated content back to the main file
    fs.writeFileSync(mainFilePath, updatedContent, 'utf-8');
    console.log(`Updated content has been written to ${mainFilePath}`);
}

// Parse command-line arguments
if (process.argv.length < 4) {
    console.error('Usage: node resolve_functions_and_iifes.js <main_file> <lookup_file>');
    process.exit(1);
}

const mainFilePath = process.argv[2];
const lookupFilePath = process.argv[3];

if (!fs.existsSync(mainFilePath)) {
    console.error(`Main file not found: ${mainFilePath}`);
    process.exit(1);
}

if (!fs.existsSync(lookupFilePath)) {
    console.error(`Lookup file not found: ${lookupFilePath}`);
    process.exit(1);
}

// Resolve external functions and associated IIFEs
resolveExternalFunctionsAndIIFEs(mainFilePath, lookupFilePath);
