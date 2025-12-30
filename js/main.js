/**
 * Academic Profile - Main JavaScript
 * Handles interactive features and utilities
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initSmoothScroll();
    initNewsToggle();
    initLazyLoading();
    initMobileMenu();
});

/**
 * Mobile hamburger menu toggle
 */
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!navToggle || !navLinks) return;
    
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Toggle for showing more/less news items
 * Add class 'news-expandable' to news-list and limit initial display
 */
function initNewsToggle() {
    const newsList = document.querySelector('.news-list');
    if (!newsList) return;

    const newsItems = newsList.querySelectorAll('.news-item');
    const maxVisible = 5; // Number of news items to show initially

    if (newsItems.length > maxVisible) {
        // Hide extra items
        newsItems.forEach((item, index) => {
            if (index >= maxVisible) {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'news-toggle';
        toggleBtn.textContent = `Show more (${newsItems.length - maxVisible} more)`;
        toggleBtn.style.cssText = `
            background: none;
            border: none;
            color: #666;
            font-size: 0.85rem;
            cursor: pointer;
            padding: 0.5rem 0;
            margin-top: 0.5rem;
        `;

        let expanded = false;
        toggleBtn.addEventListener('click', function() {
            expanded = !expanded;
            newsItems.forEach((item, index) => {
                if (index >= maxVisible) {
                    item.style.display = expanded ? 'flex' : 'none';
                }
            });
            toggleBtn.textContent = expanded 
                ? 'Show less' 
                : `Show more (${newsItems.length - maxVisible} more)`;
        });

        newsList.parentNode.appendChild(toggleBtn);
    }
}

/**
 * Lazy loading for images
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * Utility: Format date
 * @param {string} dateStr - Date string (e.g., "2025-12-29")
 * @returns {string} Formatted date (e.g., "Dec 2025")
 */
function formatDate(dateStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(dateStr);
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Utility: Update last modified date in footer
 */
function updateLastModified() {
    const footer = document.querySelector('.footer p');
    if (footer) {
        const now = new Date();
        const formatted = formatDate(now.toISOString().split('T')[0]);
        footer.innerHTML = footer.innerHTML.replace(
            /Last updated:.*?\./,
            `Last updated: ${formatted}.`
        );
    }
}
