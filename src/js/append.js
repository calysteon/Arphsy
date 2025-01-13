const fs = require('fs');

function copyAndAppendFile(sourceFilePath, destinationFilePath) {
    if (!fs.existsSync(sourceFilePath)) {
        console.error(`Source file not found: ${sourceFilePath}`);
        process.exit(1);
    }

    if (!fs.existsSync(destinationFilePath)) {
        console.error(`Destination file not found: ${destinationFilePath}`);
        process.exit(1);
    }

    // Read the source file content
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf-8');

    // Append the content to the destination file
    fs.appendFileSync(destinationFilePath, sourceContent);

    console.log(`Contents of ${sourceFilePath} have been appended to ${destinationFilePath}.`);
}

// Parse command-line arguments
if (process.argv.length < 4) {
    console.error('Usage: node append_file.js <source_file_path> <destination_file_path>');
    process.exit(1);
}

const sourceFilePath = process.argv[2];
const destinationFilePath = process.argv[3];

// Copy and append the file
copyAndAppendFile(sourceFilePath, destinationFilePath);
