# Assets Directory

This folder contains static assets for the academic profile website.

## Structure

```
assets/
├── images/
│   ├── avatar.jpg        # Your profile photo (recommended: 400x400px)
│   └── ...               # Other images
├── cv.pdf                # Your CV/Resume
└── README.md             # This file
```

## Guidelines

### Profile Photo
- **Recommended size**: 400x400 pixels (will be displayed as 180x180)
- **Format**: JPG or PNG
- **Filename**: `avatar.jpg` (or update the path in `index.html`)

### CV
- **Format**: PDF
- **Filename**: `cv.pdf` (or update the path in `index.html`)

### Adding New Assets
1. Place files in the appropriate subdirectory
2. Reference them in HTML using relative paths: `assets/images/filename.jpg`
