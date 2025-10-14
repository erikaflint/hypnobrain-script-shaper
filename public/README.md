# Static Files Directory

Drop any static files here and they'll be served at:
```
http://localhost:5000/static/your-file.ext
```

## Examples

**Place a file:**
```bash
public/document.pdf
```

**Access via URL:**
```
http://localhost:5000/static/document.pdf
```

## Supported File Types
- Documents: `.pdf`, `.txt`, `.doc`, `.docx`
- Images: `.jpg`, `.png`, `.gif`, `.svg`
- Data: `.json`, `.csv`, `.xml`
- Any other static files

## Usage
1. Drop your file into the `public/` directory
2. Access it at `http://localhost:5000/static/filename.ext`
3. Files are served directly with appropriate content types

## Test Files
- `test.txt` - Plain text file
- `test.json` - JSON data file
- `sample.txt` - Sample text file
