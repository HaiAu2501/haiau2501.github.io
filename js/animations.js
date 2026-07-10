import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Subtle first-load motion for the profile page.
 *
 * Keep motion optional: visitors who request reduced motion receive the same
 * content and interactions without transitions.
 */
export function initEntranceAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const sidebar = document.querySelector('.sidebar');
    const nav = document.querySelector('.navbar');

    const timeline = gsap.timeline({
        defaults: {
            ease: 'power2.out',
            duration: 0.6,
        },
    });

    if (nav) {
        timeline.from(nav, { autoAlpha: 0, y: -12, duration: 0.45 });
    }

    if (sidebar) {
        timeline.from(sidebar, { autoAlpha: 0, x: -18 }, '-=0.2');
    }

    initScrollProgress();
    initAvatarMotion();
    initHeroCards();
    initStatementCards();
    initMetricCards();
    initNewsCascade();
    initPublicationSpotlight();
}

// 01 — a slim page progress signal that follows the full document.
function initScrollProgress() {
    gsap.to('.motion-progress span', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.25 },
    });
}

// 04 — portrait breathes gently; pointer movement adds restrained depth.
function initAvatarMotion() {
    const orbit = document.querySelector('.profile-orbit');
    const image = orbit?.querySelector('.profile-image');
    if (!orbit || !image) return;

    gsap.to(image, { y: -5, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    const rotateX = gsap.quickTo(image, 'rotationX', { duration: 0.45, ease: 'power3.out' });
    const rotateY = gsap.quickTo(image, 'rotationY', { duration: 0.45, ease: 'power3.out' });
    orbit.addEventListener('pointermove', event => {
        const bounds = orbit.getBoundingClientRect();
        rotateY(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
        rotateX(((event.clientY - bounds.top) / bounds.height - 0.5) * -10);
    });
    orbit.addEventListener('pointerleave', () => { rotateX(0); rotateY(0); });

    gsap.to('.profile-focus-card', {
        keyframes: [
            { x: -8, y: -8, rotation: -4.2, duration: 2.1, ease: 'sine.inOut' },
            { x: 1, y: -14, rotation: -2.4, duration: 2.1, ease: 'sine.inOut' },
            { x: 6, y: -4, rotation: -3.2, duration: 2.1, ease: 'sine.inOut' },
            { x: 0, y: 0, rotation: 0, duration: 2.1, ease: 'sine.inOut' },
        ],
        repeat: -1,
    });
    gsap.to('.profile-availability-card', {
        keyframes: [
            { x: 8, y: -4, rotation: 3.8, duration: 2.3, ease: 'sine.inOut' },
            { x: 2, y: 7, rotation: 2.2, duration: 2.3, ease: 'sine.inOut' },
            { x: -6, y: 2, rotation: 3.2, duration: 2.3, ease: 'sine.inOut' },
            { x: 0, y: 0, rotation: 0, duration: 2.3, ease: 'sine.inOut' },
        ],
        delay: 0.55,
        repeat: -1,
    });
    gsap.to('.profile-role-card', {
        keyframes: [
            { x: -7, y: 7, rotation: -2.2, duration: 2.5, ease: 'sine.inOut' },
            { x: 4, y: 11, rotation: -0.8, duration: 2.5, ease: 'sine.inOut' },
            { x: 8, y: 2, rotation: -1.6, duration: 2.5, ease: 'sine.inOut' },
            { x: 0, y: 0, rotation: 0, duration: 2.5, ease: 'sine.inOut' },
        ],
        delay: 1.1,
        repeat: -1,
    });
}

// 05 — oversized headline cards arrive as a layered typographic composition.
function initHeroCards() {
    const hero = document.querySelector('.type-hero');
    const cards = gsap.utils.toArray('.type-card');
    if (!hero || !cards.length) return;

    gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.type-hero-meta', { autoAlpha: 0, y: -12, duration: 0.55 })
        .from(cards, {
            autoAlpha: 0,
            x: index => index % 2 ? 140 : -140,
            y: 55,
            rotation: index => index % 2 ? 8 : -8,
            stagger: 0.12,
            duration: 1.05,
        }, '-=0.25')
        .from('.type-hero-caption', { autoAlpha: 0, y: 12, duration: 0.5 }, '-=0.45');

    cards.forEach((card, index) => {
        const direction = index % 2 ? 1 : -1;
        gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 2.6 + index * 0.75 })
            .to(card, {
                xPercent: direction * 118,
                autoAlpha: 0,
                rotation: `+=${direction * 4}`,
                duration: 0.72,
                ease: 'power2.in',
            })
            .set(card, { xPercent: direction * -118, rotation: direction * -6 })
            .to(card, {
                xPercent: 0,
                autoAlpha: 1,
                rotation: 0,
                duration: 0.9,
                ease: 'expo.out',
            })
            .to(card, { y: index % 2 ? -7 : 7, duration: 1.1, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    });
}

// 08 — the research philosophy crosses and separates as it scrolls into view.
function initStatementCards() {
    const stack = document.querySelector('.statement-stack');
    if (!stack) return;

    const red = stack.querySelector('.statement-card-red');
    const champagne = stack.querySelector('.statement-card-champagne');
    if (!red || !champagne) return;

    const redFloat = gsap.to(red, {
        y: -7,
        rotation: -0.8,
        duration: 2.7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true,
    });
    const champagneFloat = gsap.to(champagne, {
        y: 7,
        rotation: 0.7,
        duration: 3.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true,
    });

    function lockStatements() {
        redFloat.pause(0);
        champagneFloat.pause(0);
        gsap.timeline({ onComplete: () => { redFloat.restart(); champagneFloat.restart(); } })
            .fromTo(red,
                { xPercent: -120, y: 22, autoAlpha: 0, rotation: -7 },
                { xPercent: 0, y: 0, autoAlpha: 1, rotation: 0, duration: 0.95, ease: 'expo.out' })
            .fromTo(champagne,
                { xPercent: 120, y: -18, autoAlpha: 0, rotation: 7 },
                { xPercent: 0, y: 0, autoAlpha: 1, rotation: 0, duration: 0.95, ease: 'expo.out' }, '-=0.62');
    }

    gsap.set([red, champagne], { autoAlpha: 0 });
    ScrollTrigger.create({
        trigger: stack,
        start: 'top 82%',
        onEnter: lockStatements,
        onEnterBack: lockStatements,
    });
}

// 09 — metric cards fan into place and keep a subtle independent rhythm.
function initMetricCards() {
    const metrics = document.querySelector('.publication-metrics');
    if (!metrics) return;
    const cards = gsap.utils.toArray('.metric-card');

    cards.forEach((card, index) => {
        gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: index * 0.65 })
            .fromTo(card,
                { yPercent: 125, autoAlpha: 0, rotation: (index - 1) * 7 },
                { yPercent: 0, autoAlpha: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.45)' })
            .to(card, { y: index === 1 ? 5 : -5, duration: 1.1, yoyo: true, repeat: 1, ease: 'sine.inOut' })
            .to(card, { yPercent: -125, autoAlpha: 0, duration: 0.72, ease: 'power2.in' }, '+=1.8');
    });
}

// 10 — milestones arrive as a compact cascade, preserving the editorial list.
function initNewsCascade() {
    const news = document.querySelector('#news .news-list');
    if (!news) return;
    gsap.from('#news .news-item', {
        x: -16,
        autoAlpha: 0,
        stagger: 0.055,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: news, start: 'top 84%', once: true },
    });
}

// 11 — publication glow follows the pointer without moving the card itself.
function initPublicationSpotlight() {
    document.querySelectorAll('.pub-item').forEach(item => {
        item.addEventListener('pointermove', event => {
            const bounds = item.getBoundingClientRect();
            item.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
            item.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
        });
    });

    const publications = document.querySelector('#publications .publications-list');
    if (publications) {
        const items = gsap.utils.toArray('#publications .pub-item');
        gsap.set(items, { clearProps: 'opacity,visibility,transform' });
        ScrollTrigger.batch(items, {
            start: 'top 92%',
            onEnter: batch => gsap.fromTo(batch,
                { y: 24 },
                { y: 0, stagger: 0.055, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }),
            onEnterBack: batch => gsap.fromTo(batch,
                { y: -18 },
                { y: 0, stagger: 0.045, duration: 0.55, ease: 'power3.out', overwrite: 'auto' }),
        });
    }
}
