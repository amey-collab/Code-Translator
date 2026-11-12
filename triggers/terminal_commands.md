# Terminal Commands Reference

## Command Format
`Convert Code Language-<target_language>`

## Supported Target Languages
- `python` - Convert to Python
- `c` - Convert to C
- `cpp` - Convert to C++
- `java` - Convert to Java
- `js` - Convert to JavaScript

## Usage Examples
```
Convert Code Language-python
Convert Code Language-c
Convert Code Language-cpp
Convert Code Language-java
Convert Code Language-js
```

## Command Processing
1. User types command in terminal
2. Extension captures command via terminal API
3. Extracts target language from suffix
4. Validates command format
5. Triggers conversion process

## Error Messages
- Invalid format: "Invalid command format. Use: Convert Code Language-<language>"
- Unknown language: "Unsupported target language: <language>"
- No file open: "No file is currently open in editor"