import re
import sys
import os
import json

def find_first_hex(file_path):
    try:
        with open(file_path, 'r') as file:
            js_content = file.read()

        # Regex pattern to match the specific function with the placeholder name
        pattern = r"([a-zA-Z0-9_]+)\s*=\s*function\s*\(.*\)\s*{\s*r\s*=\s*r\s*-\s*(0x[0-9a-fA-F]{1,3});"

        match = re.search(pattern, js_content)
        if not match:
            print(f"Function 'PLACEHOLDER' not found in the file or does not match the expected format.")
            return None

        # Extract the first hex value
        first_hex = match.group(2)
        return first_hex

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' does not exist.")
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

def append_statement(target_file, hex_value, strVal):
    if not os.path.exists(target_file):
        print(f"Target file not found: {target_file}")
        sys.exit(1)

    # Append the statement to the target file
    statement = f"\nconst {strVal} = {hex_value};\n"
    with open(target_file, 'a', encoding='utf-8') as file:
        file.write(statement)

    print(f"Appended statement to {target_file}: {statement.strip()}")

def find_largest_string_array(file_path):
    try:
        with open(file_path, 'r') as file:
            js_content = file.read()

        # Regex to match arrays of strings
        array_pattern = re.compile(r'\[([^\]]*)\]')

        largest_array = []

        for match in array_pattern.finditer(js_content):
            # Extract potential array elements and split them by commas
            elements = [item.strip().strip('"\'') for item in match.group(1).split(',') if item.strip()]

            # Ensure all elements are strings
            if all(isinstance(item, str) for item in elements):
                if len(elements) > len(largest_array):
                    largest_array = elements

        # Return the largest array and its length
        return len(largest_array)

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' does not exist.")
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

# Parse command-line arguments
if len(sys.argv) < 2:
    print("Usage: python counter.py <target_file>")
    sys.exit(1)

target_file = sys.argv[1]

# Find the first hex value in the source file
first_hex = find_first_hex(target_file)

line_count = find_largest_string_array(target_file)

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