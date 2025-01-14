# Arphsy

This is the repository for the upcoming "Sunlight for Darcula: Autonomously Resolving Function Calls with Arphsy" paper. 

Once published, the upcoming paper will be linked here for brevity. 

## Acknowledgements

We would like to thank both Angelica Reeser and Victor Haugen for their contributions to our research. 

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
