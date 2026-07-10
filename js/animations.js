import { gsap } from 'gsap';

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
    const sections = gsap.utils.toArray('.content > .section');

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

    if (sections.length) {
        timeline.from(sections, {
            autoAlpha: 0,
            y: 16,
            stagger: 0.055,
            duration: 0.5,
            clearProps: 'opacity,transform,visibility',
        }, '-=0.25');
    }
}
