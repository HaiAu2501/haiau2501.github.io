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

// 04 — portrait breathes gently; precise pointers add restrained depth.
function initAvatarMotion() {
    const orbit = document.querySelector('.profile-orbit');
    const image = orbit?.querySelector('.profile-image');
    if (!orbit || !image) return;

    gsap.to(image, { y: -11, rotation: 0.7, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.profile-focus-card', { x: -9, y: -13, rotation: -3.5, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.profile-availability-card', { x: 10, y: -10, rotation: 3, duration: 3.1, delay: 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.profile-role-card', { x: -7, y: 11, rotation: -2.2, duration: 3.3, delay: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const rotateX = gsap.quickTo(image, 'rotationX', { duration: 0.4, ease: 'power3.out' });
        const rotateY = gsap.quickTo(image, 'rotationY', { duration: 0.4, ease: 'power3.out' });
        let bounds;
        let frame;
        let pointer;
        orbit.addEventListener('pointerenter', () => { bounds = orbit.getBoundingClientRect(); });
        orbit.addEventListener('pointermove', event => {
            pointer = { x: event.clientX, y: event.clientY };
            if (frame) return;
            frame = requestAnimationFrame(() => {
                bounds ||= orbit.getBoundingClientRect();
                rotateY(((pointer.x - bounds.left) / bounds.width - 0.5) * 10);
                rotateX(((pointer.y - bounds.top) / bounds.height - 0.5) * -10);
                frame = null;
            });
        });
        orbit.addEventListener('pointerleave', () => { rotateX(0); rotateY(0); });
    }
}

// 05 — oversized headline cards arrive as a layered typographic composition.
function initHeroCards() {
    const hero = document.querySelector('.type-hero');
    const cards = gsap.utils.toArray('.type-card');
    if (!hero || !cards.length) return;

    const entrance = gsap.timeline({ defaults: { ease: 'expo.out' } });
    entrance
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

    entrance.eventCallback('onComplete', () => {
        cards.forEach((card, index) => {
            const floatOffsets = [-4, 22, -18];
            gsap.to(card, {
                y: floatOffsets[index],
                duration: 2.4 + index * 0.35,
                delay: index * 0.28,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        });
    });
}

// 09 — metric cards fan into place once when they enter the viewport.
function initMetricCards() {
    const metrics = document.querySelector('.publication-metrics');
    if (!metrics) return;
    const cards = gsap.utils.toArray('.metric-card');

    gsap.from(cards, {
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: metrics, start: 'top 88%', once: true },
    });
}

// 10 — milestones arrive as a compact cascade, preserving the editorial list.
function initNewsCascade() {
    const news = document.querySelector('#news .news-list');
    if (!news) return;
    gsap.from('#news .news-item:not(.is-collapsed)', {
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
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('.pub-item').forEach(item => {
            let bounds;
            let frame;
            let pointer;
            item.addEventListener('pointerenter', () => { bounds = item.getBoundingClientRect(); });
            item.addEventListener('pointermove', event => {
                pointer = { x: event.clientX, y: event.clientY };
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    bounds ||= item.getBoundingClientRect();
                    item.style.setProperty('--spot-x', `${pointer.x - bounds.left}px`);
                    item.style.setProperty('--spot-y', `${pointer.y - bounds.top}px`);
                    frame = null;
                });
            });
        });
    }

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
