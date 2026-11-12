# Error Handling Documentation

## Common Errors and Solutions

### Command Format Errors
**Error**: "Invalid command format"
**Solution**: Use exact format: `Convert Code Language-<language>`

### File Access Errors
**Error**: "No file is currently open in editor"
**Solution**: Open a code file before running conversion command

**Error**: "Cannot read file content"
**Solution**: Ensure file is accessible and not corrupted

### Language Detection Errors
**Error**: "Source Language Not Identified"
**Solution**: 
- Check if file contains recognizable code patterns
- Add file extension if missing
- Manual conversion may be required

### Conversion Errors
**Error**: "Conversion from X to Y not yet supported"
**Solution**: Check supported language combinations in usage guide

**Error**: Partial conversion with TODO comments
**Solution**: Review TODO sections manually - complex logic may need adjustment

## Error Recovery
- Extension never crashes VS Code
- Failed conversions show error messages
- Original files remain untouched
- User can retry with different parameters