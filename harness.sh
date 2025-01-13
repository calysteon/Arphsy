#!/bin/bash

# Function to display usage information
usage() {
    echo "Usage: $0 -s SOURCE_FILE_JS -e EXTRACTED_FILE_JS -k GROQ_API_KEY -v VERIFIED_FILE_JS"
    echo ""
    echo "  -s SOURCE_FILE_JS      Path to the source JavaScript file"
    echo "  -e EXTRACTED_FILE_JS   Path to the extracted JavaScript file"
    echo "  -k GROQ_API_KEY        Groq API key"
    echo "  -v VERIFIED_FILE_JS    Path to the verified JavaScript file"
    exit 1
}

# Parse command-line arguments
while getopts "s:e:k:v:" opt; do
    case $opt in
        s) SOURCE_FILE_JS=$OPTARG ;;
        e) EXTRACTED_FILE_JS=$OPTARG ;;
        k) GROQ_API_KEY=$OPTARG ;;
        v) VERIFIED_FILE_JS=$OPTARG ;;
        *) usage ;;
    esac
done

# Ensure all required arguments are provided
if [[ -z "$SOURCE_FILE_JS" || -z "$EXTRACTED_FILE_JS" || -z "$GROQ_API_KEY" || -z "$VERIFIED_FILE_JS" ]]; then
    usage
fi

# Run the first command
echo "Running extractor.js script..."
node src/extractor.js "$SOURCE_FILE_JS" "$EXTRACTED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: extractor.js script execution failed."
    exit 1
fi

# Run the second command
echo "Running Python verifier script..."
python3 src/verifier.py "$EXTRACTED_FILE_JS" "$GROQ_API_KEY" "$VERIFIED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: Python verifier script execution failed."
    exit 1
fi

# Run the third command
echo "Running resolver.js script..."
node src/resolver.js "$VERIFIED_FILE_JS" "$SOURCE_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: resolver.js script execution failed."
    exit 1
fi

# Run the fourth command
echo "Running Python verifier script..."
python3 src/verifier.py "$VERIFIED_FILE_JS" "$GROQ_API_KEY" "$VERIFIED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: Python verifier script execution failed."
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

# Then append replacer.js to verified.js
echo "Running Python integrator script..."
python3 src/integrator.py "$VERIFIED_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: Python verifier script execution failed."
    exit 1
fi

# Resolving all variable names
echo "Resolving all variable names"
node $VERIFIED_FILE_JS "$SOURCE_FILE_JS"
if [[ $? -ne 0 ]]; then
    echo "Error: verified.js script execution failed."
    exit 1
fi

echo "Processing completed successfully."
