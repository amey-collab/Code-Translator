# Command Listener Module

## Purpose
Reads terminal input and detects conversion commands in the format:
`Convert Code Language-<target_language>`

## Supported Commands
- `Convert Code Language-python`
- `Convert Code Language-c`
- `Convert Code Language-cpp`
- `Convert Code Language-java`
- `Convert Code Language-js`

## Functionality
- Monitor terminal input for conversion commands
- Extract target language from command suffix
- Validate command format
- Trigger conversion process when valid command detected
- Show error message for invalid command format

## Error Handling
- Invalid format → "Invalid command format. Use: Convert Code Language-<language>"
- Unknown language → "Unsupported target language: <language>"