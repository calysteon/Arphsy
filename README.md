# advaJS

This is the code repository for the "Sunlight for Darcula: Autonomous Variable Reassignment" paper

# Requirements

## Python

```
pip install groq, sys, os
```

## JavaScript

```
npm install fs
npm install acorn
npm install path
```

# Usage

Note: Replace `GROQ_API_KEY` with your API key for Groq.

```sh
npm install fs; npm install acorn; npm install path; bash harness.sh -s "./sample/sample.js" -e "./sample/extracted.js" -k "GROQ_API_KEY" -v "./sample/verified.js"
```