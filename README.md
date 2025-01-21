# Arphsy

![Arphsy](https://github.com/user-attachments/assets/1b258de8-1cb4-42ef-9d38-64db53f67aca)

# Requirements

## Python

```
pip install sys, os
```

## JavaScript

```
npm install fs
npm install acorn
npm install path
npm install estraverse
npm install escodegen
```

# Usage

```sh
# Run Arphsy against a sample with 63 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.js" -s "./sample/63.js"

# Run Arphsy against a sample with 110 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.js" -s "./sample/110.js"

# Run Arphsy against a sample with 338 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.js" -s "./sample/338.js"

# Run Arphsy against a sample with 409 lines of obfuscated JavaScript
bash harness.sh -e "./sample/extracted.js" -v "./sample/verified.js" -s "./sample/409.js"
```

# Acknowledgements

We would like to thank both Angelica Reeser and Victor Haugen for their contributions to our research. 
