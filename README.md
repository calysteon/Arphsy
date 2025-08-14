# Arphsy

![Arphsy](https://github.com/user-attachments/assets/1b258de8-1cb4-42ef-9d38-64db53f67aca)

# Paper

https://arxiv.org/html/2501.13256v1

# Requirements

## Python

```
pip install sys, os
```

## JavaScript

```
npm install fs acorn path estraverse escodegen @babel/parser @babel/traverse @babel/generator @babel/types
```

# Usage

```sh
# Run Arphsy against a sample with 63 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.mjs" -s "./sample/63.js"

# Run Arphsy against a sample with 110 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.mjs" -s "./sample/110.js"

# Run Arphsy against a sample with 338 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.mjs" -s "./sample/338.js"

# Run Arphsy against a sample with 409 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.mjs" -s "./sample/409.js"
```
