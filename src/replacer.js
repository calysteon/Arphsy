const fs = require("fs");

function findExtendedHexInRange(filePath, startRange, endRange) {
    /**
     * Find all instances of hex values in the file within the specified range,
     * including any preceding alphanumeric characters up to a space, '[' or '('.
     *
     * @param {string} filePath - Path to the file.
     * @param {number} startRange - Start of the range (inclusive).
     * @param {number} endRange - End of the range (inclusive).
     * @returns {Array} - List of objects with full match and hex value.
     */
    const pattern = /([\w]*\(0x[0-9a-fA-F]+\))/g;
    const matches = [];

    try {
        const data = fs.readFileSync(filePath, "utf8");

        const lines = data.split("\n");
        lines.forEach((line) => {
            const found = line.match(pattern);
            if (found) {
                found.forEach((match) => {
                    const hexMatch = match.match(/\(0x[0-9a-fA-F]+\)/)[0];
                    const hexValue = parseInt(hexMatch.slice(3, -1), 16);
                    if (hexValue >= startRange && hexValue <= endRange) {
                        matches.push({ fullMatch: match, hexValue: hexMatch.slice(1, -1) });
                    }
                });
            }
        });
    } catch (err) {
        console.error("Error reading the file:", err);
    }

    return matches;
}

function replaceMatchesInFile(filePath, matches, processedResults) {
    /**
     * Replace matching instances in the file with processed results.
     *
     * @param {string} filePath - Path to the file.
     * @param {Array} matches - List of matching strings.
     * @param {Array} processedResults - List of processed replacements.
     */
    try {
        let data = fs.readFileSync(filePath, "utf8");

        // Replace each match with the corresponding processed result wrapped in quotes
        matches.forEach((match, index) => {
            // Clean up newlines from processed results
            const cleanedResult = processedResults[index].replace(/\n/g, "");
            const quotedResult = `'${cleanedResult}'`;
            data = data.replace(match, quotedResult);
        });

        // Write the updated content back to the file
        fs.writeFileSync(filePath, data, "utf8");
        console.log("File updated successfully.");
    } catch (err) {
        console.error("Error updating the file:", err);
    }
}

// Example usage
const filePath = "/home/calysteon/Desktop/WOFF2/assets/index-d453acc2 copy.js"; // Replace with your file path

const results = findExtendedHexInRange(filePath, startHex, endHex);
console.log("Matching instances:");
console.log(results.map((result) => result.fullMatch));

// Process only the hex values through a38A
const processedResults = results.map((result) => a38A(result.hexValue));
console.log("Processed results:");
console.log(processedResults);

// Replace matches in the original file
replaceMatchesInFile(
    filePath,
    results.map((result) => result.fullMatch),
    processedResults
);

