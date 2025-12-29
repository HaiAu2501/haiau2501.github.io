# Academic Profile Website

A minimalist, black & white academic profile website template. Clean, elegant, and easy to extend.

## 📁 Project Structure

```
├── index.html              # Main homepage
├── css/
│   └── style.css           # All styles (CSS variables for easy customization)
├── js/
│   └── main.js             # JavaScript utilities
├── assets/
│   ├── images/
│   │   └── avatar.jpg      # Your profile photo
│   ├── cv.pdf              # Your CV
│   └── README.md           # Assets guidelines
└── README.md               # This file
```

## 🚀 Quick Start

1. **Add your photo**: Place your profile photo at `assets/images/avatar.jpg`
2. **Add your CV**: Place your CV at `assets/cv.pdf`
3. **Edit content**: Update `index.html` with your information
4. **Deploy**: Push to GitHub and enable GitHub Pages

## ✏️ Customization Guide

### Updating Personal Information

Edit `index.html` and update:
- Name, title, and affiliation in the sidebar
- Contact links (email, GitHub, Google Scholar, LinkedIn)
- About section content
- Education, Experience, and other sections

### Adding a New News Item

Find the `<ul class="news-list">` section and add at the top:

```html
<li class="news-item">
    <span class="news-date">Month Year</span>
    <span class="news-content">Your news content here!</span>
</li>
```

### Adding a New Publication

Find the `<div class="publications-list">` section and add:

```html
<div class="pub-item">
    <div class="pub-year">2025</div>
    <div class="pub-content">
        <h3 class="pub-title">Your Paper Title</h3>
        <p class="pub-authors">
            <strong>Your Name</strong>, Co-author One, Co-author Two
        </p>
        <p class="pub-venue">Conference/Journal Name, Year</p>
        <div class="pub-links">
            <a href="#" class="pub-link">[Paper]</a>
            <a href="#" class="pub-link">[Code]</a>
        </div>
    </div>
</div>
```

### Adding Education/Experience Entry

Find the relevant `.timeline` section and add:

```html
<div class="timeline-item">
    <div class="timeline-period">Year - Year</div>
    <div class="timeline-content">
        <h3>Position/Degree</h3>
        <p class="institution">Institution Name</p>
        <p class="details">Additional details</p>
    </div>
</div>
```

### Adding Awards

Find the `<ul class="awards-list">` section and add:

```html
<li>
    <span class="award-year">Year</span>
    <span class="award-name">Award Name, Organization</span>
</li>
```

## 🎨 Styling Customization

All colors and sizes can be easily changed via CSS variables in `css/style.css`:

```css
:root {
    --color-bg: #ffffff;           /* Background color */
    --color-text: #1a1a1a;         /* Main text color */
    --color-text-light: #666666;   /* Secondary text */
    --color-accent: #000000;       /* Accent color (buttons) */
    --color-link: #0066cc;         /* Link color */
    --sidebar-width: 280px;        /* Sidebar width */
}
```

## 📱 Features

- ✅ Responsive design (mobile-friendly)
- ✅ Clean, minimalist aesthetic
- ✅ Print-friendly styles
- ✅ Easy to extend and maintain
- ✅ No build tools required
- ✅ Fast loading (minimal dependencies)

## 🌐 Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select "main" branch as source
4. Your site will be live at `https://yourusername.github.io`

## 📄 License

Feel free to use and modify this template for your personal academic website.
