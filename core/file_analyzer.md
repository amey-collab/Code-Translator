# File Analyzer Module

## Purpose
Gets active file information and reads code content for conversion

## Functionality
- Detect currently active editor tab
- Read file content from active editor
- Extract file path and extension
- Validate file is open and accessible
- Handle multiple editor windows

## Data Extraction
- File path
- File extension
- Full code content
- Cursor position (for future features)
- File encoding

## Error Handling
- No file open → "No file is currently open in editor"
- File not accessible → "Cannot read file content"
- Binary file → "Cannot convert binary files"