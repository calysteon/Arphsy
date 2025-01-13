import os
import sys
from groq import Groq

def extract_javascript_content(content, output_file):
    """
    Extracts content between ```javascript and ``` from the input string
    and writes it to the specified output file.
    
    Args:
        content (str): The string containing the JavaScript code block.
        output_file (str): The file path where the extracted content will be written.
    """
    import re

    # Regular expression to extract content between ```javascript and ```
    match = re.search(r"```javascript(.*?)```", content, re.DOTALL)
    if match:
        javascript_content = match.group(1).strip()
        with open(output_file, "w") as file:
            file.write(javascript_content)
        print(f"JavaScript content written to {output_file}")
    else:
        print("No JavaScript content found in the input.")

def check_and_correct_file(file_path, groq_api_key, file_path_out):

    client = Groq(
        api_key=groq_api_key,
    )

    # Load file to be corrected
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")

    with open(file_path, 'r') as file:
        file_content = file.read()

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Fix this JavaScript file but only respond with the fixed file. However only complete parenthesis or other small formatting issues. Add all missing semi-colons, especially after an IIFE. Do not change any value or add the keyword this: " + file_content,
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    extract_javascript_content(chat_completion.choices[0].message.content, file_path_out)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_and_correct.py <file_path>")
    else:
        file_path = sys.argv[1]
        groq_api_key = sys.argv[2]
        file_path_out = sys.argv[3]
        check_and_correct_file(file_path, groq_api_key, file_path_out)
