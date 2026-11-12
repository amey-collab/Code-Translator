# Kiro Code Translator - Usage Guide

## Quick Start
1. Open any code file in VS Code
2. Open terminal in VS Code
3. Type: `Convert Code Language-<target>`
4. Press Enter
5. New tab opens with converted code

## Supported Languages
- Python (`.py`)
- C (`.c`)
- C++ (`.cpp`, `.cxx`, `.cc`)
- Java (`.java`)
- JavaScript (`.js`)

## Command Examples
```bash
Convert Code Language-python    # Convert to Python
Convert Code Language-c         # Convert to C
Convert Code Language-cpp       # Convert to C++
Convert Code Language-java      # Convert to Java
Convert Code Language-js        # Convert to JavaScript
```

## What Happens
1. Extension detects your open file
2. Automatically identifies source language
3. Converts code to target language
4. Opens result in new tab (original unchanged)
5. Applies syntax highlighting

## Important Notes
- Original file is never modified
- Conversion opens in new untitled tab
- Manual review may be needed for complex code
- TODO comments mark areas needing attention