import re
import sys
import os
import json

def find_first_hex(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()

    # Regex to match the pattern `- 0x` followed by a hexadecimal value
    hex_pattern = r"-\s*0x[0-9a-fA-F]+"
    match = re.search(hex_pattern, file_content)

    if match:
        # Extract and return the hex value without the `-`
        return match.group().replace("- ", "")
    else:
        return None

def append_statement(target_file, hex_value, strVal):
    if not os.path.exists(target_file):
        print(f"Target file not found: {target_file}")
        sys.exit(1)

    # Append the statement to the target file
    statement = f"\nconst {strVal} = {hex_value};\n"
    with open(target_file, 'a', encoding='utf-8') as file:
        file.write(statement)

    print(f"Appended statement to {target_file}: {statement.strip()}")

def count_lines_between(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    # Read the file content line by line
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    start_index = None
    end_index = None

    # Find the first occurrence of `= [` and `return`
    for i, line in enumerate(lines):
        if start_index is None and "= [" in line:
            start_index = i
        if start_index is not None and "return" in line:
            end_index = i
            break

    # If either `= [` or `return` is not found
    if start_index is None:
        print("`= [` not found in the file.")
        return None
    if end_index is None:
        print("`return` not found after `= [` in the file.")
        return None

    # Count the lines between `= [` and `return`
    line_count = end_index - start_index - 1
    return line_count

# Parse command-line arguments
if len(sys.argv) < 2:
    print("Usage: python counter.py <target_file>")
    sys.exit(1)

target_file = sys.argv[1]

# Find the first hex value in the source file
first_hex = find_first_hex(target_file)

line_count = count_lines_between(target_file)

#if line_count is not None:
#    print(f"The number of lines between `= [` and `return` is: {line_count}")

first_hex_int = int(first_hex, 16)

second_hex_int = line_count + first_hex_int

second_hex = hex(second_hex_int)

if first_hex:
    append_statement(target_file, first_hex, "startHex")
else:
    print("No hex value found in the source file.")

if second_hex:
    append_statement(target_file, second_hex, "endHex")
else:
    print("No hex value found in the source file.")