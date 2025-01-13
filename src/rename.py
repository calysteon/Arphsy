import re
import sys
import os

def rename_first_export(file_path, new_name):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()

    # Regex to match `module.exports = { ... }` and capture the first property
    export_regex = r"export\s*\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\};"
    match = re.search(export_regex, file_content)

    if not match:
        print("No exports found in the file.")
        return

    # Extract the first export name
    first_export = match.group(1)
    print(f"First export found: {first_export}")

    # Replace all instances of the first export name with the new name
    updated_content = re.sub(rf"\b{re.escape(first_export)}\b", new_name, file_content)

    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(updated_content)

    print(f"Renamed all instances of '{first_export}' to '{new_name}' in the file.")

# Parse command-line arguments
if len(sys.argv) < 3:
    print("Usage: python rename.py <file_path> <new_name>")
    sys.exit(1)

file_path = sys.argv[1]
new_name = sys.argv[2]

rename_first_export(file_path, new_name)
