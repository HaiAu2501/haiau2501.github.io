/**
 * Academic Profile - Main JavaScript
 * Handles interactive features and utilities
 */

import { initEntranceAnimations } from './animations.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initThemeToggle();
    initSmoothScroll();
    initNewsToggle();
    initLazyLoading();
    initMobileMenu();
    initPublicationAccordion();
    initLineageMode();
    initEntranceAnimations();
});

/**
 * Light/dark theme toggle. Dark is the default theme.
 */
function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    function getCurrentTheme() {
        return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    }

    function setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.dataset.theme = 'light';
        } else {
            delete document.documentElement.dataset.theme;
        }

        toggle.setAttribute(
            'aria-label',
            theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
        );
        toggle.setAttribute(
            'title',
            theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
        );
        toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');

        try {
            localStorage.setItem('theme', theme);
        } catch (error) {}
    }

    setTheme(getCurrentTheme());

    toggle.addEventListener('click', function() {
        setTheme(getCurrentTheme() === 'light' ? 'dark' : 'light');
    });
}

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
            color: var(--color-text-light);
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

function initPublicationAccordion() {
    const items = document.querySelectorAll('.pub-item');
    if (!items.length) return;

    const mobileQuery = window.matchMedia('(max-width: 900px)');

    function placeDetailsForViewport(item, isMobile) {
        const content = item.querySelector('.pub-content');
        const details = item.querySelector('.pub-details') || item.nextElementSibling;
        if (!content || !details || !details.classList.contains('pub-details')) return;

        if (isMobile) {
            if (details.parentElement !== content) {
                content.appendChild(details);
            }
            details.classList.add('pub-details-mobile');
        } else {
            if (details.parentElement !== content) {
                content.appendChild(details);
            }
            details.classList.remove('pub-details-mobile');
            details.hidden = false;
        }
    }

    function syncAccordionState() {
        items.forEach(item => {
            const toggle = item.querySelector('.pub-toggle');
            const details = item.querySelector('.pub-details') || item.nextElementSibling;
            if (!toggle) return;

            if (mobileQuery.matches) {
                const expanded = item.classList.contains('pub-expanded');
                placeDetailsForViewport(item, true);
                toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                if (details && details.classList.contains('pub-details')) {
                    details.hidden = !expanded;
                }
            } else {
                item.classList.remove('pub-expanded');
                placeDetailsForViewport(item, false);
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    items.forEach(item => {
        const toggle = item.querySelector('.pub-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function() {
            if (!mobileQuery.matches) return;
            item.classList.toggle('pub-expanded');
            const expanded = item.classList.contains('pub-expanded');
            const details = item.querySelector('.pub-details') || item.nextElementSibling;
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            if (details && details.classList.contains('pub-details')) {
                details.hidden = !expanded;
            }
        });
    });

    syncAccordionState();

    if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', syncAccordionState);
    } else if (typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(syncAccordionState);
    }
}

/**
 * Research Lineage mode.
 *
 * A fixed "edge rail" sits in the middle of the right-hand gutter while the
 * Publications section is on screen. Clicking it swaps the section content
 * between the publication list and the Research Lineage map, in place, while
 * the rail glides across to the left gutter and flips into a "back" control.
 */
function initLineageMode() {
    const section = document.querySelector('#publications');
    const stage = section?.querySelector('.publication-view-stage');
    const listPanel = section?.querySelector('[data-publication-view="list"]');
    const lineagePanel = section?.querySelector('[data-publication-view="lineage"]');
    const rail = document.querySelector('.lineage-edge');

    if (!section || !stage || !listPanel || !lineagePanel || !rail) return;

    const label = rail.querySelector('.lineage-edge-label');
    const lineage = initResearchLineage(lineagePanel);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let showingLineage = false;
    let transitioning = false;

    function syncRail() {
        const text = showingLineage ? 'Show publication list' : 'Show Research Lineage';
        rail.setAttribute('aria-label', text);
        rail.setAttribute('title', text);
        rail.setAttribute('aria-pressed', String(showingLineage));
        if (label) label.textContent = showingLineage ? 'Publication List' : 'Research Lineage';
    }

    // The rail only surfaces while the Publications section is on screen.
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => rail.classList.toggle('is-visible', entry.isIntersecting));
    }, { rootMargin: '-10% 0px -10% 0px' });
    observer.observe(section);

    function setView(nextLineage) {
        if (transitioning || nextLineage === showingLineage) return;
        transitioning = true;

        const current = showingLineage ? lineagePanel : listPanel;
        const target = nextLineage ? lineagePanel : listPanel;
        showingLineage = nextLineage;

        document.body.classList.toggle('lineage-mode', showingLineage);
        syncRail();

        const outDuration = reduceMotion.matches ? 0 : 240;
        const inDuration = reduceMotion.matches ? 0 : 500;

        // Pin the stage height so it can animate between panel heights.
        stage.classList.add('is-animating');
        stage.style.height = `${stage.offsetHeight}px`;
        if (!reduceMotion.matches) current.classList.add('view-leave');

        window.setTimeout(() => {
            current.classList.remove('view-leave');
            current.hidden = true;
            current.setAttribute('aria-hidden', 'true');

            target.hidden = false;
            target.setAttribute('aria-hidden', 'false');
            if (!reduceMotion.matches) target.classList.add('view-enter');

            stage.style.height = `${target.scrollHeight}px`;
            requestAnimationFrame(() => lineage.redraw());

            // Let GSAP ScrollTrigger re-measure the changed layout.
            window.dispatchEvent(new Event('resize'));

            window.setTimeout(() => {
                target.classList.remove('view-enter');
                stage.style.height = '';
                stage.classList.remove('is-animating');
                lineage.redraw();
                transitioning = false;
            }, inDuration);
        }, outDuration);
    }

    rail.addEventListener('click', () => setView(!showingLineage));

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setView(false);
    });

    syncRail();
}

function initResearchLineage(scope) {
    const map = scope.querySelector('#publication-lineage-map');
    const canvas = scope.querySelector('#publication-lineage-connections');
    const context = canvas?.getContext('2d');
    const nodes = map ? [...map.querySelectorAll('.publication-lineage-node')] : [];

    if (!map || !canvas || !context || !nodes.length) {
        return { redraw() {} };
    }

    const byId = new Map(nodes.map(node => [node.dataset.lineageId, node]));
    const edges = nodes
        .filter(node => node.dataset.lineageParent)
        .map(node => ({ from: node.dataset.lineageParent, to: node.dataset.lineageId }));

    let activeId = null;
    let pinnedId = null;

    function lineage(id) {
        const visible = new Set([id]);
        let changed = true;

        while (changed) {
            changed = false;
            edges.forEach(({ from, to }) => {
                if (visible.has(from) && !visible.has(to)) {
                    visible.add(to);
                    changed = true;
                }
            });
        }

        let cursor = byId.get(id);
        while (cursor?.dataset.lineageParent) {
            visible.add(cursor.dataset.lineageParent);
            cursor = byId.get(cursor.dataset.lineageParent);
        }

        return visible;
    }

    function anchor(node, side) {
        const mapBox = map.getBoundingClientRect();
        const nodeBox = node.getBoundingClientRect();
        return {
            x: nodeBox.left - mapBox.left + nodeBox.width / 2,
            y: nodeBox.top - mapBox.top + (side === 'bottom' ? nodeBox.height + 2 : -2),
        };
    }

    function drawEdge(from, to, active) {
        const rootStyle = getComputedStyle(document.documentElement);
        const bend = Math.max(30, (to.y - from.y) * 0.42);
        context.save();
        context.strokeStyle = active
            ? rootStyle.getPropertyValue('--color-link').trim()
            : rootStyle.getPropertyValue('--color-border').trim();
        context.globalAlpha = active ? 0.9 : (activeId ? 0.08 : 0.8);
        context.lineWidth = active ? 1.7 : 1;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.bezierCurveTo(from.x, from.y + bend, to.x, to.y - bend, to.x, to.y);
        context.stroke();
        context.restore();
    }

    function redraw() {
        const box = map.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(box.width * ratio);
        canvas.height = Math.round(box.height * ratio);
        canvas.style.width = `${box.width}px`;
        canvas.style.height = `${box.height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, box.width, box.height);

        if (window.matchMedia('(max-width: 640px)').matches) return;

        const visible = activeId ? lineage(activeId) : null;
        edges.forEach(({ from, to }) => {
            drawEdge(
                anchor(byId.get(from), 'bottom'),
                anchor(byId.get(to), 'top'),
                Boolean(visible && visible.has(from) && visible.has(to)),
            );
        });
    }

    function renderState() {
        const visible = activeId ? lineage(activeId) : null;
        nodes.forEach(node => {
            const isActive = node.dataset.lineageId === activeId;
            const isRelated = Boolean(visible && visible.has(node.dataset.lineageId) && !isActive);
            node.classList.toggle('is-active', isActive);
            node.classList.toggle('is-descendant', isRelated);
            node.classList.toggle('is-hidden-branch', Boolean(visible && !visible.has(node.dataset.lineageId)));
            node.setAttribute('aria-pressed', String(node.dataset.lineageId === pinnedId));
        });
        redraw();
    }

    nodes.forEach(node => {
        node.addEventListener('pointerenter', () => {
            if (!pinnedId) activeId = node.dataset.lineageId;
            renderState();
        });

        node.addEventListener('pointerleave', () => {
            if (!pinnedId) activeId = null;
            renderState();
        });

        node.addEventListener('focus', () => {
            if (!pinnedId) activeId = node.dataset.lineageId;
            renderState();
        });

        node.addEventListener('blur', () => {
            if (!pinnedId) activeId = null;
            renderState();
        });

        node.addEventListener('click', () => {
            pinnedId = pinnedId === node.dataset.lineageId ? null : node.dataset.lineageId;
            activeId = pinnedId;
            renderState();
        });
    });

    new ResizeObserver(redraw).observe(map);
    new MutationObserver(redraw).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
    });

    renderState();
    return { redraw };
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
