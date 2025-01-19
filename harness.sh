#!/bin/bash

# Function to display usage information
usage() {
    echo "Usage: $0 -s SOURCE_FILE_JS -e EXTRACTED_FILE_JS -k GROQ_API_KEY -v VERIFIED_FILE_JS"
    echo ""
    echo "  -s SOURCE_FILE_JS      Path to the source JavaScript file"
    echo "  -e EXTRACTED_FILE_JS   Path to the extracted JavaScript file"
    echo "  -v VERIFIED_FILE_JS    Path to the verified JavaScript file"
    exit 1
}

# Parse command-line arguments
while getopts "s:e:k:v:" opt; do
    case $opt in
        s) SOURCE_FILE_JS=$OPTARG ;;
        e) EXTRACTED_FILE_JS=$OPTARG ;;
        v) VERIFIED_FILE_JS=$OPTARG ;;
        *) usage ;;
    esac
done

# Ensure all required arguments are provided
if [[ -z "$SOURCE_FILE_JS" || -z "$EXTRACTED_FILE_JS" || -z "$VERIFIED_FILE_JS" ]]; then
    usage
fi

rm "$EXTRACTED_FILE_JS" 
rm "$VERIFIED_FILE_JS"

touch "$EXTRACTED_FILE_JS" 
touch "$VERIFIED_FILE_JS"

#=========================================#
# Phase 1
#=========================================#

echo "Running iife.js script..."
node src/js/iife.js "$SOURCE_FILE_JS" "$EXTRACTED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: iife.js script execution failed."
    exit 1
fi

echo "Running filter.js script..."
node src/js/filter.js "$SOURCE_FILE_JS" "$EXTRACTED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: filter.js script execution failed."
    exit 1
fi

echo "Running mrv.js script..."
node src/js/mrv.js "$SOURCE_FILE_JS" "$EXTRACTED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: mrv.js script execution failed."
    exit 1
fi

# Renaming the exported function
echo "Running Python renaming script..."
python3 src/rename.py "$VERIFIED_FILE_JS" "PLACEHOLDER"
if [[ $? -ne 0 ]]; then
    echo "Error: Python verifier script execution failed."
    exit 1
fi

# Calculating the Hex Values
echo "Running Python hex value script..."
python3 src/counter.py "$VERIFIED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: Python verifier script execution failed."
    exit 1
fi

# 
echo "Running Python integrator script..."
python3 src/integrator.py "$VERIFIED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: Python verifier script execution failed."
    exit 1
fi

cp "$SOURCE_FILE_JS" "$EXTRACTED_FILE_JS"

#=========================================#
# Phase 3
#=========================================#

# Resolving all variable names
echo "Resolving all variable names"
node $VERIFIED_FILE_JS "$EXTRACTED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: verified.js script execution failed."
    exit 1
fi

echo "Processing completed successfully. Check sample/extracted.js"
