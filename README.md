# Arphsy

Phishing-as-a-Service (PhaaS) frameworks have significantly lowered the barrier of entry for individuals interested in conducting sophisticated phishing campaigns. For a monthly fee, PhaaS frameworks will provide an individual with a phishing toolkit for easy deployment and customization of at-scale phishing attacks. Recently, we identified a popular PhaaS, Darcula, as employing robust and advanced obfuscation techniques that not only hide the intended functionality of code but also are created in such a way as to allow for the complex deployment of modern-day web applications written in high-level languages such as NodeJS. To combat the obfuscation techniques deployed by Darcula, we present Arphsy, an innovative methodology for the Autonomous Resolution of Function Calls (ARFC) that leverages Darcula's obfuscation logic for deobfuscation. We accomplish ARFC by (i) Identifying the most reassigned variable in a file, (ii) Recursively resolving the identified variable until a function body is reached, (iii) Resolving any externally referenced functions within the identified variable's function body, (iv) Integrating all resolved code snippets into a harness script, and (v) Invoking the harness script to out-of-context call the most reassigned variable's function body to resolve each function autonomously call within a target file. Moreover, we show the scalability of Arphsy and how it can be scaled and adapted to an arbitrary use case through a modular plug-and-play design.

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
