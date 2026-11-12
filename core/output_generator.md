# Output Generator Module

## Purpose
Creates new editor tab with converted code result

## Functionality
- Generate new untitled document
- Set appropriate language mode for syntax highlighting
- Insert converted code content
- Position new tab next to original
- Focus on new tab
- Never overwrite original file

## File Naming Convention
- `Untitled-<original_name>-to-<target_language>`
- Example: `Untitled-main.py-to-cpp`

## Syntax Highlighting
- Python → `python`
- C → `c`
- C++ → `cpp`
- Java → `java`
- JavaScript → `javascript`

## Content Structure
```
// Converted from <source_language> to <target_language>
// Original file: <original_path>
// Conversion timestamp: <timestamp>

<converted_code_content>

// End of conversion
```

## Error Handling
- Tab creation failure → Show error message
- Content insertion failure → Create empty tab with error comment