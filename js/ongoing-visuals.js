/**
 * Ongoing research: a compact animated pipeline under each direction.
 *
 * Every diagram is a single row of stages laid out on a fixed grid (a glyph,
 * a label underneath, a straight connector between neighbours), so nothing
 * can overlap. Motion is SMIL along paths plus a few CSS loops; diagrams
 * pause off screen and stay still for visitors who prefer reduced motion.
 */

const VIEW_W = 480;
const VIEW_H = 86;
const PAD = 20;
const CY = 34;
const LABEL_Y = 78;

const rider = (path, { dur = 1.8, begin = 0, cls = 'ov-fill-red', r = 2.6 } = {}) => `
    <circle r="${r}" class="${cls}" opacity="0">
        <animateMotion dur="${dur}s" begin="${-begin}s" repeatCount="indefinite" path="${path}"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="${dur}s" begin="${-begin}s" repeatCount="indefinite"/>
    </circle>`;

const text = (x, y, value, cls = 'ov-label') => `<text x="${x}" y="${y}" class="${cls}">${value}</text>`;

/* ---------- Glyphs: each is drawn around (cx, CY), within ±20px vertically ---------- */

const glyphs = {
    llm: cx => `
        <rect x="${cx - 24}" y="${CY - 18}" width="48" height="36" rx="9" class="ov-box ov-red"/>
        ${[-10, -1, 8].map((dx, i) => `<rect x="${cx + dx - 1}" y="${CY - 8}" width="5" height="16" rx="2.5" class="ov-fill-red ov-think" style="animation-delay:${i * 0.18}s"/>`).join('')}`,

    code: cx => `
        <rect x="${cx - 14}" y="${CY - 19}" width="36" height="28" rx="5" class="ov-box ov-ghost"/>
        <rect x="${cx - 19}" y="${CY - 14}" width="36" height="28" rx="5" class="ov-box ov-solid ov-ghost"/>
        <rect x="${cx - 24}" y="${CY - 9}" width="36" height="28" rx="5" class="ov-box ov-solid ov-champ"/>
        ${[[14, 0], [20, 0.3], [10, 0.6]].map(([w, d], i) => `<rect x="${cx - 18}" y="${CY - 3 + i * 7}" width="${w}" height="3" rx="1.5" class="ov-fill-champ ov-type" style="animation-delay:${d}s"/>`).join('')}`,

    route: cx => {
        const pts = [[-24, -10], [-6, -17], [20, -12], [24, 8], [2, 16], [-20, 12]].map(([x, y]) => [cx + x, CY + y]);
        const d = `M${pts.map(p => p.join(' ')).join(' L')} Z`;
        return `<path d="${d}" pathLength="1" class="ov-path ov-red ov-draw"/>
            ${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" class="ov-node"/>`).join('')}`;
    },

    bars: cx => [16, 22, 28, 36].map((h, i) => `
        <rect x="${cx - 22 + i * 12}" y="${CY + 18 - h}" width="8" height="${h}" rx="2" class="${i === 3 ? 'ov-fill-red' : 'ov-fill-champ'} ov-bar" style="animation-delay:${i * 0.2}s"/>`).join(''),

    table: cx => `
        ${[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => `<rect x="${cx - 24 + c * 12.5}" y="${CY - 17 + r * 9}" width="10.5" height="7" rx="1.5" class="ov-cell"/>`).join('')).join('')}
        <rect x="${cx - 26}" y="${CY - 19}" width="52" height="11" rx="2.5" class="ov-scan">
            <animate attributeName="y" values="${[0, 1, 2, 3].map(r => CY - 19 + r * 9).join(';')}" dur="3.2s" calcMode="discrete" repeatCount="indefinite"/>
        </rect>`,

    prior: cx => `
        <rect x="${cx - 24}" y="${CY - 18}" width="48" height="36" rx="9" class="ov-box ov-red"/>
        <g class="ov-spin" style="transform-origin:${cx}px ${CY}px">
            <path d="M${cx} ${CY - 11} Q${cx + 2} ${CY - 2} ${cx + 11} ${CY} Q${cx + 2} ${CY + 2} ${cx} ${CY + 11} Q${cx - 2} ${CY + 2} ${cx - 11} ${CY} Q${cx - 2} ${CY - 2} ${cx} ${CY - 11} Z" class="ov-fill-champ"/>
        </g>`,

    net: cx => {
        const layers = [[cx - 22, [-12, 0, 12]], [cx, [-15, -5, 5, 15]], [cx + 22, [-7, 7]]];
        const edges = [];
        for (let l = 0; l < 2; l++) {
            layers[l][1].forEach(a => layers[l + 1][1].forEach(b => edges.push([layers[l][0], CY + a, layers[l + 1][0], CY + b])));
        }
        return `${edges.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ov-edge"/>`).join('')}
            ${[edges[1], edges[6], edges[13], edges[18]].map(([x1, y1, x2, y2], i) => rider(`M${x1} ${y1} L${x2} ${y2}`, { dur: 1.2, begin: i * 0.3, cls: 'ov-fill-champ', r: 1.8 })).join('')}
            ${layers.map(([x, ys]) => ys.map(y => `<circle cx="${x}" cy="${CY + y}" r="3.4" class="ov-node"/>`).join('')).join('')}`;
    },

    boundary: cx => `
        <rect x="${cx - 30}" y="${CY - 19}" width="60" height="38" rx="6" class="ov-frame"/>
        ${[[-20, -10], [-8, -13], [6, -8], [20, -12], [16, 2]].map(([x, y]) => `<circle cx="${cx + x}" cy="${CY + y}" r="2.4" class="ov-fill-red"/>`).join('')}
        ${[[-20, 10], [-10, 3], [2, 12], [14, 13], [22, 9]].map(([x, y]) => `<circle cx="${cx + x}" cy="${CY + y}" r="2.4" class="ov-fill-champ"/>`).join('')}
        <path class="ov-path ov-white" d="M${cx - 28} ${CY} C${cx - 10} ${CY + 10} ${cx + 8} ${CY - 12} ${cx + 28} ${CY + 4}">
            <animate attributeName="d" dur="4s" repeatCount="indefinite"
                values="M${cx - 28} ${CY + 6} C${cx - 10} ${CY - 8} ${cx + 8} ${CY + 14} ${cx + 28} ${CY - 4};M${cx - 28} ${CY} C${cx - 10} ${CY + 10} ${cx + 8} ${CY - 12} ${cx + 28} ${CY + 6};M${cx - 28} ${CY + 6} C${cx - 10} ${CY - 8} ${cx + 8} ${CY + 14} ${cx + 28} ${CY - 4}"/>
        </path>`,

    frames: cx => `
        <rect x="${cx - 14}" y="${CY - 19}" width="38" height="28" rx="4" class="ov-box ov-ghost"/>
        <rect x="${cx - 19}" y="${CY - 14}" width="38" height="28" rx="4" class="ov-box ov-solid ov-ghost"/>
        <rect x="${cx - 24}" y="${CY - 9}" width="38" height="28" rx="4" class="ov-box ov-solid ov-white"/>
        <line x1="${cx - 20}" y1="${CY + 13}" x2="${cx + 10}" y2="${CY + 13}" class="ov-edge"/>
        <circle r="4" cy="${CY + 9}" class="ov-fill-red"><animate attributeName="cx" values="${cx - 15};${cx + 5};${cx - 15}" dur="2.6s" repeatCount="indefinite"/></circle>`,

    encoder: cx => `<path d="M${cx - 15} ${CY - 18} L${cx + 15} ${CY - 8} L${cx + 15} ${CY + 8} L${cx - 15} ${CY + 18} Z" class="ov-box ov-champ ov-solid"/>`,

    latent: cx => `
        <circle cx="${cx}" cy="${CY}" r="13" class="ov-ring"/>
        <circle cx="${cx}" cy="${CY}" r="13" class="ov-box ov-red ov-solid"/>
        ${text(cx, CY + 4.5, 'z', 'ov-glyph-text')}`,

    rollout: cx => [-34, 0, 34].map((dx, i) => `
        <circle cx="${cx + dx}" cy="${CY}" r="10" class="ov-box ov-red ov-imagine" style="animation-delay:${i * 0.4}s"/>
        ${i < 2 ? `<path d="M${cx + dx + 14} ${CY} L${cx + dx + 20} ${CY} M${cx + dx + 17} ${CY - 3} L${cx + dx + 20} ${CY} L${cx + dx + 17} ${CY + 3}" class="ov-line"/>` : ''}`).join(''),

    arm: cx => `
        <line x1="${cx - 22}" y1="${CY + 19}" x2="${cx + 22}" y2="${CY + 19}" class="ov-edge"/>
        <rect x="${cx - 9}" y="${CY + 13}" width="18" height="6" rx="2" class="ov-box ov-solid ov-white"/>
        <g transform="translate(${cx} ${CY + 13})">
            <g><animateTransform attributeName="transform" type="rotate" values="-35;25;-35" dur="3.6s" repeatCount="indefinite"/>
                <line x1="0" y1="0" x2="0" y2="-18" class="ov-arm"/>
                <g transform="translate(0 -18)">
                    <g><animateTransform attributeName="transform" type="rotate" values="80;25;80" dur="3.6s" repeatCount="indefinite"/>
                        <line x1="0" y1="0" x2="0" y2="-13" class="ov-arm"/>
                        <path d="M-4 -17 L-4 -13 L4 -13 L4 -17" class="ov-path ov-red"/>
                        <circle r="2.6" class="ov-fill-champ"/>
                    </g>
                </g>
                <circle r="3" class="ov-fill-champ"/>
            </g>
        </g>`,

    resblock: (cx, index) => {
        const skip = `M${cx - 16} ${CY - 6} C${cx - 16} ${CY - 24} ${cx + 16} ${CY - 24} ${cx + 16} ${CY - 6}`;
        return `
        <rect x="${cx - 14}" y="${CY - 2}" width="28" height="20" rx="5" class="ov-box ov-champ ov-solid ov-block" style="animation-delay:${index * 0.35}s"/>
        ${text(cx, CY + 12, 'F', 'ov-glyph-text')}
        <path d="${skip}" class="ov-line ov-red-line ov-dashed"/>
        <path d="M${cx + 13} ${CY - 10} L${cx + 16} ${CY - 6} L${cx + 19} ${CY - 10}" class="ov-path ov-red"/>
        ${rider(skip, { dur: 1.4, begin: index * 0.35, r: 2.2 })}`;
    },

    field: cx => {
        const arrows = [];
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                const x = cx - 50 + i * 20;
                const y = CY - 13 + j * 13;
                const a = Math.sin(i * 0.8 + j * 1.1) * 0.8 - 0.35;
                const x2 = x + Math.cos(a) * 7;
                const y2 = y + Math.sin(a) * 7;
                arrows.push(`<line x1="${x}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="ov-edge"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="1.2" class="ov-fill-muted"/>`);
            }
        }
        const traj = `M${cx - 56} ${CY + 14} C${cx - 30} ${CY + 18} ${cx - 20} ${CY - 16} ${cx} ${CY - 6} S${cx + 30} ${CY + 14} ${cx + 56} ${CY - 16}`;
        return `${arrows.join('')}
            <path d="${traj}" pathLength="1" class="ov-path ov-red ov-draw ov-thick"/>
            <circle r="3.6" class="ov-fill-champ"><animateMotion dur="4s" repeatCount="indefinite" path="${traj}"/></circle>`;
    },

    gridworld: cx => `
        ${[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => `<rect x="${cx - 21 + c * 11}" y="${CY - 21 + r * 11}" width="9" height="9" rx="1.5" class="ov-cell"/>`).join('')).join('')}
        <rect x="${cx + 12}" y="${CY + 12}" width="9" height="9" rx="1.5" class="ov-fill-champ"/>
        <circle r="3.4" class="ov-fill-red">
            <animateMotion dur="4s" repeatCount="indefinite" calcMode="discrete" keyPoints="0;0.17;0.33;0.5;0.67;0.83;1" keyTimes="0;0.14;0.28;0.42;0.56;0.7;0.84"
                path="M${cx - 16.5} ${CY - 16.5} L${cx - 5.5} ${CY - 16.5} L${cx - 5.5} ${CY - 5.5} L${cx + 5.5} ${CY - 5.5} L${cx + 5.5} ${CY + 5.5} L${cx + 16.5} ${CY + 5.5} L${cx + 16.5} ${CY + 16.5}"/>
        </circle>`,

    embed: cx => {
        const centres = [[-28, -7, 'red'], [4, 8, 'champ'], [30, -6, 'white']];
        const starts = [[-40, 12], [36, 10], [-10, -14], [18, -14], [-30, -12], [40, -14], [-4, 14], [26, 14], [-42, 0], [8, -4], [-18, 6], [44, 2]];
        return `<rect x="${cx - 52}" y="${CY - 20}" width="104" height="40" rx="6" class="ov-frame"/>
            ${starts.map(([sx, sy], i) => {
                const [ccx, ccy, cls] = centres[i % 3];
                const jx = ((i * 7) % 5) - 2;
                const jy = ((i * 3) % 5) - 2;
                return `<circle r="2.6" class="ov-fill-${cls}">
                    <animate attributeName="cx" values="${cx + sx};${cx + ccx + jx * 2};${cx + ccx + jx * 2};${cx + sx}" keyTimes="0;0.4;0.85;1" dur="5s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="${CY + sy};${CY + ccy + jy * 2};${CY + ccy + jy * 2};${CY + sy}" keyTimes="0;0.4;0.85;1" dur="5s" repeatCount="indefinite"/>
                </circle>`;
            }).join('')}`;
    },

    cluster: cx => {
        const centres = [[-14, -7, 'red'], [12, -6, 'champ'], [0, 10, 'white']];
        const starts = [[-24, 12], [22, 12], [-4, -15], [24, -14], [-24, -14], [6, 4], [-10, 2], [18, 2], [2, -4]];
        return `<rect x="${cx - 30}" y="${CY - 20}" width="60" height="40" rx="6" class="ov-frame"/>
            ${starts.map(([sx, sy], i) => {
                const [ccx, ccy, cls] = centres[i % 3];
                const jx = ((i * 7) % 3) - 1;
                const jy = ((i * 5) % 3) - 1;
                return `<circle r="2.4" class="ov-fill-${cls}">
                    <animate attributeName="cx" values="${cx + sx};${cx + ccx + jx * 4};${cx + ccx + jx * 4};${cx + sx}" keyTimes="0;0.4;0.85;1" dur="4.5s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="${CY + sy};${CY + ccy + jy * 4};${CY + ccy + jy * 4};${CY + sy}" keyTimes="0;0.4;0.85;1" dur="4.5s" repeatCount="indefinite"/>
                </circle>`;
            }).join('')}`;
    },

    policy: cx => `
        <rect x="${cx - 22}" y="${CY - 16}" width="44" height="32" rx="8" class="ov-box ov-red ov-solid"/>
        ${text(cx, CY + 5, 'π', 'ov-glyph-text ov-glyph-lg')}`,

    agents: cx => {
        const pos = [0, 1, 2, 3, 4].map(i => {
            const t = -Math.PI / 2 + i * (Math.PI * 2 / 5);
            return [cx + Math.cos(t) * 44, CY + Math.sin(t) * 17];
        });
        const pairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3], [2, 4], [3, 0], [4, 1]];
        const shape = (i, x, y) => {
            const cls = `ov-box ov-solid ${i % 2 ? 'ov-champ' : 'ov-red'}`;
            if (i % 3 === 1) return `<path d="M${x} ${y - 6} L${x + 6} ${y + 4.5} L${x - 6} ${y + 4.5} Z" class="${cls}"/>`;
            if (i % 3 === 2) return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2" class="${cls}"/>`;
            return `<circle cx="${x}" cy="${y}" r="5.5" class="${cls}"/>`;
        };
        return `${pairs.map(([a, b]) => `<line x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}" class="ov-edge"/>`).join('')}
            ${pairs.map(([a, b], i) => rider(`M${pos[a][0]} ${pos[a][1]} L${pos[b][0]} ${pos[b][1]}`, { dur: 1.6, begin: i * 0.27, cls: i % 2 ? 'ov-fill-champ' : 'ov-fill-red', r: 1.8 })).join('')}
            <circle cx="${cx}" cy="${CY}" r="6" class="ov-ring ov-ring-champ"/>
            <circle cx="${cx}" cy="${CY}" r="3" class="ov-fill-champ"/>
            ${pos.map(([x, y], i) => `<g class="ov-agent" style="animation-delay:${i * 0.35}s;transform-origin:${x}px ${y}px">${shape(i, x, y)}</g>`).join('')}`;
    },

    regret: cx => `
        <path d="M${cx - 50} ${CY - 20} L${cx - 50} ${CY + 18} L${cx + 52} ${CY + 18}" class="ov-line"/>
        <path d="M${cx - 46} ${CY - 18} C${cx - 20} ${CY} ${cx + 10} ${CY + 6} ${cx + 50} ${CY + 8}" class="ov-path ov-white ov-dashed"/>
        <path d="M${cx - 46} ${CY - 10} C${cx - 36} ${CY + 8} ${cx - 26} ${CY + 2} ${cx - 16} ${CY + 9} S${cx + 10} ${CY + 12} ${cx + 22} ${CY + 13} S${cx + 40} ${CY + 14} ${cx + 50} ${CY + 14}" pathLength="1" class="ov-path ov-red ov-draw ov-thick"/>`,
};

/* ---------- Layout: stages on a row, connectors in the gaps ---------- */

function connector(x1, x2, kind, index) {
    if (kind === 'plus') {
        const mid = (x1 + x2) / 2;
        return `<path d="M${mid - 5} ${CY} L${mid + 5} ${CY} M${mid} ${CY - 5} L${mid} ${CY + 5}" class="ov-line ov-plus"/>`;
    }
    const a = x1 + 10;
    const b = x2 - 10;
    const dashed = kind === 'limit' ? ' ov-dashed' : '';
    return `<path d="M${a} ${CY} L${b} ${CY}" class="ov-line${dashed}"/>
        <path d="M${b - 5} ${CY - 4} L${b} ${CY} L${b - 5} ${CY + 4}" class="ov-line"/>
        ${kind === 'limit' ? text((a + b) / 2, CY - 8, 'Δt→0', 'ov-label ov-label-sm') : rider(`M${a} ${CY} L${b - 4} ${CY}`, { dur: 1.6, begin: index * 0.45 })}`;
}

function pipeline(stages) {
    const total = stages.reduce((sum, stage) => sum + stage.w, 0);
    const gap = (VIEW_W - PAD * 2 - total) / (stages.length - 1);
    let x = PAD;
    let out = '';
    stages.forEach((stage, index) => {
        const cx = x + stage.w / 2;
        out += glyphs[stage.g](cx, index);
        if (stage.label) out += text(cx, LABEL_Y, stage.label);
        if (index < stages.length - 1) out += connector(x + stage.w, x + stage.w + gap, stages[index + 1].join, index);
        x += stage.w + gap;
    });
    return out;
}

const diagrams = {
    heuristic: [
        { g: 'llm', w: 48, label: 'LLM' },
        { g: 'code', w: 48, label: 'heuristics' },
        { g: 'route', w: 52, label: 'solve' },
        { g: 'bars', w: 48, label: 'fitness' },
    ],
    informed: [
        { g: 'table', w: 52, label: 'tabular data' },
        { g: 'prior', w: 48, label: 'LLM prior', join: 'plus' },
        { g: 'net', w: 50, label: 'model' },
        { g: 'boundary', w: 60, label: 'prediction' },
    ],
    world: [
        { g: 'frames', w: 48, label: 'frames' },
        { g: 'encoder', w: 30, label: 'encode' },
        { g: 'latent', w: 30, label: 'latent' },
        { g: 'rollout', w: 90, label: 'imagine' },
        { g: 'arm', w: 48, label: 'act' },
    ],
    residual: [
        { g: 'resblock', w: 36, label: 'x + F(x)' },
        { g: 'resblock', w: 36, label: '' },
        { g: 'resblock', w: 36, label: '' },
        { g: 'field', w: 120, label: 'dz/dt = f(z, t)', join: 'limit' },
    ],
    representation: [
        { g: 'gridworld', w: 44, label: 'environment' },
        { g: 'encoder', w: 30, label: 'encode' },
        { g: 'embed', w: 104, label: 'representation' },
        { g: 'policy', w: 44, label: 'policy' },
    ],
    multiagent: [
        { g: 'agents', w: 100, label: 'agents interact' },
        { g: 'cluster', w: 60, label: 'self-organize' },
        { g: 'regret', w: 104, label: 'regret ≤ bound' },
    ],
};

export function initOngoingVisuals() {
    const items = document.querySelectorAll('.ongoing-item[data-visual]');
    if (!items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver(entries => entries.forEach(entry => {
            const svg = entry.target;
            svg.parentElement.classList.toggle('is-playing', entry.isIntersecting);
            if (entry.isIntersecting) svg.unpauseAnimations?.();
            else svg.pauseAnimations?.();
        }), { rootMargin: '60px 0px' })
        : null;

    items.forEach(item => {
        const stages = diagrams[item.dataset.visual];
        if (!stages) return;

        const figure = document.createElement('div');
        figure.className = 'ongoing-visual';
        figure.setAttribute('aria-hidden', 'true');
        figure.innerHTML = `<svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" xmlns="http://www.w3.org/2000/svg">${pipeline(stages)}</svg>`;
        // The diagram sits below its card, not inside it; a wrapper keeps the
        // pair together so the list spacing stays between directions.
        const group = document.createElement('div');
        group.className = 'ongoing-group';
        item.before(group);
        group.append(item, figure);

        // Optional notes written inside the card move below the diagram.
        const notes = item.querySelector('.ongoing-notes');
        if (notes) group.appendChild(notes);

        const svg = figure.firstElementChild;
        if (reduceMotion) {
            svg.pauseAnimations?.();
            svg.setCurrentTime?.(1.6);
        } else if (observer) {
            svg.pauseAnimations?.();
            observer.observe(svg);
        } else {
            figure.classList.add('is-playing');
        }
    });
}

/* ========================================================================
 * Paper figures: two-row method diagrams placed as a card under a paper.
 * Rows sit in dashed frames with a legend; stages share four fixed columns
 * so both rows line up, and arrows only ever run between stages or frames.
 * ===================================================================== */

const FIG_H = 244;
const COLS = [76, 186, 296, 406];

const hArrow = (from, to, y, { ride = true, begin = 0 } = {}) => {
    const dir = Math.sign(to - from);
    return `<path d="M${from} ${y} L${to} ${y}" class="ov-line"/>
        <path d="M${to - dir * 5} ${y - 4} L${to} ${y} L${to - dir * 5} ${y + 4}" class="ov-line"/>
        ${ride ? rider(`M${from} ${y} L${to - dir * 4} ${y}`, { dur: 1.6, begin }) : ''}`;
};

const vArrow = (x, from, to, caption) => `
    <path d="M${x} ${from} L${x} ${to}" class="ov-line"/>
    <path d="M${x - 4} ${to - Math.sign(to - from) * 5} L${x} ${to} L${x + 4} ${to - Math.sign(to - from) * 5}" class="ov-line"/>
    ${rider(`M${x} ${from} L${x} ${to - Math.sign(to - from) * 4}`, { dur: 1.4, cls: 'ov-fill-champ' })}
    ${text(x - 10, (from + to) / 2 + 4, caption, 'ov-label ov-label-sm ov-anchor-end')}`;

// Row legend only: the figure blends into the page instead of being boxed.
const frame = (y, h, legend) => text(240, y + 4, legend, 'ov-legend ov-anchor-middle');

const figGlyphs = {
    // Program graph: the selected parent pulses, a new child keeps appearing.
    graph: (cx, cy, { pick = true } = {}) => {
        const n = [[cx, cy - 16], [cx - 18, cy - 2], [cx + 18, cy - 2], [cx - 26, cy + 14], [cx - 9, cy + 14], [cx + 12, cy + 14]];
        const child = [cx + 28, cy + 14];
        const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];
        return `${edges.map(([a, b]) => `<line x1="${n[a][0]}" y1="${n[a][1]}" x2="${n[b][0]}" y2="${n[b][1]}" class="ov-edge"/>`).join('')}
            <line x1="${n[2][0]}" y1="${n[2][1]}" x2="${child[0]}" y2="${child[1]}" class="ov-edge ov-red-line ov-grow"/>
            ${n.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" class="${pick && i === 2 ? 'ov-box ov-red ov-solid ov-pick' : 'ov-node'}"/>`).join('')}
            <circle cx="${child[0]}" cy="${child[1]}" r="4" class="ov-fill-red ov-pop" style="transform-origin:${child[0]}px ${child[1]}px"/>`;
    },

    // UCB selection: the highlight walks over the tree.
    ucb: (cx, cy) => {
        const n = [[cx, cy - 16], [cx - 18, cy - 2], [cx + 18, cy - 2], [cx - 26, cy + 14], [cx - 9, cy + 14], [cx + 12, cy + 14], [cx + 26, cy + 14]];
        const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
        return `${edges.map(([a, b]) => `<line x1="${n[a][0]}" y1="${n[a][1]}" x2="${n[b][0]}" y2="${n[b][1]}" class="ov-edge"/>`).join('')}
            ${n.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" class="ov-node"/>`).join('')}
            <circle r="6.5" class="ov-ring-static">
                <animate attributeName="cx" values="${[0, 2, 5, 0, 1, 4].map(i => n[i][0]).join(';')}" dur="4.2s" calcMode="discrete" repeatCount="indefinite"/>
                <animate attributeName="cy" values="${[0, 2, 5, 0, 1, 4].map(i => n[i][1]).join(';')}" dur="4.2s" calcMode="discrete" repeatCount="indefinite"/>
            </circle>`;
    },

    // Preference reversals between the synthetic ranking and the oracle.
    reversal: (cx, cy) => {
        const left = [cy - 14, cy, cy + 14];
        return `${left.map(y => `<rect x="${cx - 26}" y="${y - 3}" width="14" height="6" rx="2" class="ov-fill-champ"/><rect x="${cx + 12}" y="${y - 3}" width="14" height="6" rx="2" class="ov-fill-white"/>`).join('')}
            <line x1="${cx - 10}" y1="${cy + 14}" x2="${cx + 10}" y2="${cy + 14}" class="ov-edge"/>
            <line x1="${cx - 10}" y1="${cy - 14}" x2="${cx + 10}" y2="${cy}" class="ov-path ov-red ov-blink"/>
            <line x1="${cx - 10}" y1="${cy}" x2="${cx + 10}" y2="${cy - 14}" class="ov-path ov-red ov-blink"/>
            ${text(cx - 19, cy - 22, 'f̃', 'ov-label ov-label-xs')}${text(cx + 19, cy - 22, 'f', 'ov-label ov-label-xs')}`;
    },

    llm: (cx, cy) => `
        <rect x="${cx - 24}" y="${cy - 18}" width="48" height="36" rx="9" class="ov-box ov-red ov-solid"/>
        ${[-10, -1, 8].map((dx, i) => `<rect x="${cx + dx - 1}" y="${cy - 8}" width="5" height="16" rx="2.5" class="ov-fill-red ov-think" style="animation-delay:${i * 0.18}s"/>`).join('')}`,

    // Novelty gate: candidates fall into a funnel; redundant ones are rejected.
    gate: (cx, cy) => `
        <path d="M${cx - 24} ${cy - 16} L${cx + 24} ${cy - 16} L${cx + 6} ${cy + 4} L${cx + 6} ${cy + 18} L${cx - 6} ${cy + 18} L${cx - 6} ${cy + 4} Z" class="ov-box ov-champ ov-solid"/>
        ${[[-12, 'ov-fill-red', 0], [4, 'ov-fill-champ', 0.7], [14, 'ov-fill-muted', 1.4]].map(([dx, cls, b], i) => i === 2
            ? `<circle r="2.6" class="${cls}" opacity="0"><animateMotion dur="2.1s" begin="${-b}s" repeatCount="indefinite" path="M${cx + dx} ${cy - 24} L${cx + 12} ${cy - 10} L${cx + 30} ${cy - 2}"/><animate attributeName="opacity" values="0;1;1;0" dur="2.1s" begin="${-b}s" repeatCount="indefinite"/></circle>`
            : `<circle r="2.6" class="${cls}" opacity="0"><animateMotion dur="2.1s" begin="${-b}s" repeatCount="indefinite" path="M${cx + dx} ${cy - 24} L${cx} ${cy + 2} L${cx} ${cy + 24}"/><animate attributeName="opacity" values="0;1;1;0" dur="2.1s" begin="${-b}s" repeatCount="indefinite"/></circle>`).join('')}`,

    // Frozen portfolio of objectives.
    portfolio: (cx, cy) => `${[-19, 0, 19].map((dx, i) => `
        <rect x="${cx + dx - 8}" y="${cy - 16}" width="16" height="32" rx="4" class="ov-box ov-solid ${i === 1 ? 'ov-red' : 'ov-champ'}"/>
        ${[0, 1, 2].map(r => `<rect x="${cx + dx - 4}" y="${cy - 9 + r * 7}" width="${[8, 6, 7][(i + r) % 3]}" height="2.4" rx="1.2" class="ov-fill-muted"/>`).join('')}`).join('')}`,

    // Thompson sampling: Beta posteriors sharpen, a sample marks the winner.
    thompson: (cx, cy) => {
        const bell = (mu, s, h) => `M${cx - 28} ${cy + 16} C${mu - s} ${cy + 16} ${mu - s * 0.5} ${cy + 16 - h} ${mu} ${cy + 16 - h} S${mu + s} ${cy + 16} ${cx + 28} ${cy + 16}`;
        return `<line x1="${cx - 28}" y1="${cy + 16}" x2="${cx + 28}" y2="${cy + 16}" class="ov-edge"/>
            <path class="ov-path ov-champ" d="${bell(cx - 10, 16, 18)}"><animate attributeName="d" dur="4s" repeatCount="indefinite" values="${bell(cx - 10, 16, 14)};${bell(cx - 12, 12, 22)};${bell(cx - 10, 16, 14)}"/></path>
            <path class="ov-path ov-red" d="${bell(cx + 8, 14, 20)}"><animate attributeName="d" dur="4s" repeatCount="indefinite" values="${bell(cx + 6, 18, 16)};${bell(cx + 10, 8, 30)};${bell(cx + 6, 18, 16)}"/></path>
            <circle r="2.8" class="ov-fill-red"><animate attributeName="cx" dur="1.3s" repeatCount="indefinite" calcMode="discrete" values="${cx + 9};${cx - 11};${cx + 12};${cx + 8}"/><animate attributeName="cy" dur="4s" repeatCount="indefinite" values="${cy - 2};${cy - 14};${cy - 2}"/></circle>`;
    },

    // Persistent workers running in parallel lanes.
    workers: (cx, cy) => [-12, 0, 12].map((dy, i) => `
        <line x1="${cx - 28}" y1="${cy + dy}" x2="${cx + 28}" y2="${cy + dy}" class="ov-edge"/>
        <circle r="3.2" cy="${cy + dy}" class="${i === 1 ? 'ov-fill-red' : 'ov-fill-champ'}">
            <animate attributeName="cx" values="${cx - 26};${cx + 26}" dur="${[2.2, 1.6, 2.8][i]}s" repeatCount="indefinite"/>
        </circle>`).join(''),

    // Best-so-far objective value steps down; the shared incumbent is starred.
    incumbent: (cx, cy) => {
        const steps = `M${cx - 28} ${cy - 14} H${cx - 14} V${cy - 4} H${cx - 2} V${cy + 2} H${cx + 12} V${cy + 10} H${cx + 26}`;
        return `<path d="M${cx - 30} ${cy - 20} V${cy + 18} H${cx + 30}" class="ov-line"/>
            <path d="${steps}" pathLength="1" class="ov-path ov-red ov-draw ov-thick"/>
            <path d="M${cx + 26} ${cy + 3} l1.8 3.8 4.2 .6 -3 2.9 .7 4.1 -3.7 -2 -3.7 2 .7 -4.1 -3 -2.9 4.2 -.6 z" class="ov-fill-champ ov-twinkle" style="transform-origin:${cx + 26}px ${cy + 9}px"/>`;
    },

    // A new task batch slides in on top of the replayed ones.
    batch: (cx, cy) => `
        <rect x="${cx - 14}" y="${cy - 18}" width="34" height="26" rx="4" class="ov-box ov-ghost"/>
        <rect x="${cx - 18}" y="${cy - 13}" width="34" height="26" rx="4" class="ov-box ov-solid ov-ghost"/>
        <g class="ov-slide">
            <rect x="${cx - 22}" y="${cy - 8}" width="34" height="26" rx="4" class="ov-box ov-solid ov-champ"/>
            ${[0, 1, 2].map(r => `<circle cx="${cx - 15}" cy="${cy - 1 + r * 6}" r="1.6" class="ov-fill-champ"/><rect x="${cx - 11}" y="${cy - 2 + r * 6}" width="${[16, 12, 18][r]}" height="2.4" rx="1.2" class="ov-fill-muted"/>`).join('')}
        </g>`,

    // LLM with its three operators: Lift, Bridge, Reflect take turns.
    operators: (cx, cy, { keys = ['L', 'B', 'R'] } = {}) => `
        <rect x="${cx - 28}" y="${cy - 18}" width="56" height="36" rx="9" class="ov-box ov-red ov-solid"/>
        ${keys.map((k, i) => `
            <rect x="${cx - 22 + i * 16}" y="${cy - 8}" width="13" height="16" rx="4" class="ov-op" style="animation-delay:${i * 0.8}s"/>
            ${text(cx - 15.5 + i * 16, cy + 4, k, 'ov-glyph-text ov-glyph-sm')}`).join('')}`,

    // Team execution: three heterogeneous agents and the marginal gain.
    team: (cx, cy) => `
        <circle cx="${cx - 22}" cy="${cy - 6}" r="6" class="ov-box ov-solid ov-red"/>
        <path d="M${cx - 8} ${cy - 13} L${cx - 1} ${cy - 1} L${cx - 15} ${cy - 1} Z" class="ov-box ov-solid ov-champ"/>
        <rect x="${cx + 3}" y="${cy - 12}" width="12" height="12" rx="2.5" class="ov-box ov-solid ov-white"/>
        <line x1="${cx - 22}" y1="${cy + 12}" x2="${cx + 26}" y2="${cy + 12}" class="ov-edge"/>
        <rect x="${cx - 22}" y="${cy + 9}" width="40" height="6" rx="3" class="ov-fill-red ov-gain"/>
        ${text(cx + 25, cy - 2, 'Δ', 'ov-glyph-text ov-glyph-sm')}`,

    // Distil: executable code becomes a short textual principle.
    distill: (cx, cy) => `
        <rect x="${cx - 24}" y="${cy - 18}" width="48" height="36" rx="6" class="ov-box ov-solid ov-white"/>
        <g class="ov-swap-a">${text(cx, cy + 5, '{ }', 'ov-glyph-text')}</g>
        <g class="ov-swap-b">${[0, 1, 2].map(r => `<rect x="${cx - 15}" y="${cy - 8 + r * 7}" width="${[30, 22, 26][r]}" height="3" rx="1.5" class="ov-fill-champ"/>`).join('')}</g>`,

    // Reveal: a principle is broadcast to every teammate's archive.
    reveal: (cx, cy) => {
        const targets = [[cx - 22, cy - 14], [cx + 22, cy - 14], [cx, cy + 16]];
        return `<rect x="${cx - 6}" y="${cy - 6}" width="12" height="12" rx="3" class="ov-fill-champ"/>
            ${targets.map(([x, y], i) => `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="ov-edge"/>
                ${rider(`M${cx} ${cy} L${x} ${y}`, { dur: 1.5, begin: i * 0.5, cls: 'ov-fill-champ', r: 2 })}
                <circle cx="${x}" cy="${y}" r="5" class="ov-box ov-solid ${['ov-red', 'ov-champ', 'ov-white'][i]}"/>`).join('')}`;
    },

    // Outer controller: UCB picks which strategy tree to grow next.
    trees: (cx, cy) => {
        const roots = [-22, 0, 22].map(dx => [cx + dx, cy - 11]);
        return `${roots.map(([x, y], i) => `
            <line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 16}" class="ov-edge"/>
            <line x1="${x}" y1="${y}" x2="${x + 6}" y2="${y + 16}" class="ov-edge"/>
            <circle cx="${x}" cy="${y}" r="4" class="ov-node"/>
            <circle cx="${x - 6}" cy="${y + 16}" r="3" class="ov-fill-champ"/>
            <circle cx="${x + 6}" cy="${y + 16}" r="3" class="ov-fill-champ"/>
            ${text(x, y + 32, `π${['₁', '₂', '₃'][i]}`, 'ov-label ov-label-xs')}`).join('')}
            <circle r="7" cy="${cy - 11}" class="ov-ring-static">
                <animate attributeName="cx" values="${roots.map(([x]) => x).join(';')};${roots[1][0]}" dur="3.6s" calcMode="discrete" repeatCount="indefinite"/>
            </circle>`;
    },

    // Two players take turns; the move token passes back and forth.
    players: (cx, cy) => `
        <line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" class="ov-edge ov-dashed"/>
        <circle cx="${cx - 20}" cy="${cy}" r="10" class="ov-box ov-solid ov-red"/>
        <circle cx="${cx + 20}" cy="${cy}" r="10" class="ov-box ov-solid ov-champ"/>
        ${text(cx - 20, cy + 4, 'A', 'ov-glyph-text ov-glyph-sm')}${text(cx + 20, cy + 4, 'B', 'ov-glyph-text ov-glyph-sm')}
        <circle r="3" cy="${cy}" class="ov-fill-white">
            <animate attributeName="cx" values="${cx - 8};${cx + 8};${cx - 8}" dur="1.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0 0.4 1;0.6 0 0.4 1"/>
        </circle>`,

    // Reward: improvement over the baseline and over the rival.
    duel: (cx, cy) => `
        <line x1="${cx - 24}" y1="${cy + 18}" x2="${cx + 24}" y2="${cy + 18}" class="ov-edge"/>
        <line x1="${cx - 26}" y1="${cy}" x2="${cx + 26}" y2="${cy}" class="ov-line ov-dashed"/>
        <rect x="${cx - 16}" y="${cy - 16}" width="12" height="34" rx="2" class="ov-fill-red ov-bar"/>
        <rect x="${cx + 4}" y="${cy - 6}" width="12" height="24" rx="2" class="ov-fill-champ ov-bar" style="animation-delay:0.3s"/>
        ${text(cx - 10, cy - 20, 'A', 'ov-label ov-label-xs')}${text(cx + 10, cy - 10, 'B', 'ov-label ov-label-xs')}`,

    // The full solver: K strategy components wired together.
    solver: (cx, cy, { sweep = false } = {}) => `
        <rect x="${cx - 30}" y="${cy - 14}" width="60" height="28" rx="6" class="ov-frame"/>
        ${[-18, 0, 18].map((dx, i) => `
            ${i < 2 ? `<line x1="${cx + dx + 6}" y1="${cy}" x2="${cx + dx + 12}" y2="${cy}" class="ov-line"/>` : ''}
            <rect x="${cx + dx - 6}" y="${cy - 6}" width="12" height="12" rx="3" class="${sweep ? 'ov-box ov-solid ov-champ ov-sweep' : 'ov-fill-champ'}" style="animation-delay:${i * 0.8}s"/>
            ${text(cx + dx, cy + 24, `π${['₁', '₂', '₃'][i]}`, 'ov-label ov-label-xs')}`).join('')}`,

    // Accept only if the update beats both the baseline and the rival.
    accept: (cx, cy) => `
        <line x1="${cx - 26}" y1="${cy - 4}" x2="${cx + 26}" y2="${cy - 4}" class="ov-line ov-dashed"/>
        <line x1="${cx - 26}" y1="${cy + 6}" x2="${cx + 26}" y2="${cy + 6}" class="ov-line ov-red-line ov-dashed"/>
        <line x1="${cx - 24}" y1="${cy + 18}" x2="${cx + 24}" y2="${cy + 18}" class="ov-edge"/>
        <rect x="${cx - 18}" y="${cy - 14}" width="14" height="32" rx="2" class="ov-fill-champ ov-bar"/>
        <path d="M${cx + 4} ${cy - 10} L${cx + 10} ${cy - 4} L${cx + 22} ${cy - 18}" pathLength="1" class="ov-path ov-red ov-draw ov-thick"/>`,

    // Synergy: components reinforce each other once tuned together.
    synergy: (cx, cy) => {
        const n = [[cx, cy - 15], [cx - 18, cy + 12], [cx + 18, cy + 12]];
        const ring = `M${n[0][0]} ${n[0][1]} L${n[2][0]} ${n[2][1]} L${n[1][0]} ${n[1][1]} Z`;
        return `<path d="${ring}" class="ov-edge"/>
            ${[0, 0.9, 1.8].map(b => rider(ring, { dur: 2.7, begin: b, cls: 'ov-fill-red', r: 2 })).join('')}
            ${n.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6" class="ov-box ov-solid ${['ov-red', 'ov-champ', 'ov-white'][i]}"/>`).join('')}`;
    },

    // Endorse: principles that help downstream gain support in public memory.
    endorse: (cx, cy) => {
        const n = [[cx, cy - 16], [cx - 18, cy - 1], [cx + 18, cy - 1], [cx - 26, cy + 14], [cx - 9, cy + 14], [cx + 10, cy + 14], [cx + 26, cy + 14]];
        const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
        return `${edges.map(([a, b]) => `<line x1="${n[a][0]}" y1="${n[a][1]}" x2="${n[b][0]}" y2="${n[b][1]}" class="ov-edge"/>`).join('')}
            ${n.map(([x, y], i) => `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="2" class="${[2, 4].includes(i) ? 'ov-fill-red ov-endorse' : 'ov-fill-champ'}" style="transform-origin:${x}px ${y}px;animation-delay:${i * 0.3}s"/>`).join('')}`;
    },

    // Prune: low-utility leaves fade out to keep the memory compact.
    prune: (cx, cy) => {
        const n = [[cx, cy - 16], [cx - 18, cy - 1], [cx + 18, cy - 1], [cx - 26, cy + 14], [cx - 9, cy + 14], [cx + 10, cy + 14], [cx + 26, cy + 14]];
        const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
        const cut = new Set([3, 6]);
        return `${edges.map(([a, b]) => `<line x1="${n[a][0]}" y1="${n[a][1]}" x2="${n[b][0]}" y2="${n[b][1]}" class="ov-edge${cut.has(b) ? ' ov-prune' : ''}"/>`).join('')}
            ${n.map(([x, y], i) => `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="2" class="${cut.has(i) ? 'ov-fill-muted ov-prune' : 'ov-fill-champ'}"/>`).join('')}
            ${[...cut].map(i => `<path d="M${n[i][0] - 5} ${n[i][1] - 9} L${n[i][0] + 5} ${n[i][1] - 3}" class="ov-path ov-red ov-blink"/>`).join('')}`;
    },
};

function twoRow({ rows, between }) {
    const ROW1 = 22;
    const ROW2 = 160;
    let out = frame(8, 114, rows[0].legend) + frame(146, 104, rows[1].legend);

    rows.forEach((row, r) => {
        const cy = (r ? ROW2 : ROW1) + CY;
        const placed = row.stages.map(stage => ({ ...stage, cx: COLS[stage.col] }));
        placed.forEach(stage => {
            out += figGlyphs[stage.g](stage.cx, cy, stage);
            out += text(stage.cx, cy + 44, stage.label, 'ov-label ov-fig-label');
        });
        for (let i = 0; i < placed.length - 1; i++) {
            const a = placed[i];
            const b = placed[i + 1];
            const dir = Math.sign(b.cx - a.cx);
            out += hArrow(a.cx + dir * (a.w / 2 + 8), b.cx - dir * (b.w / 2 + 8), cy, { begin: i * 0.45 });
        }
        if (row.loop) {
            const first = placed[0];
            const last = placed[placed.length - 1];
            const y = cy + 56;
            const xr = 460;
            const xl = 20;
            const midL = 196;
            const midR = 284;
            const path = `M${last.cx + last.w / 2 + 6} ${cy} H${xr} V${y} H${xl} V${cy} H${first.cx - first.w / 2 - 6}`;
            out += `<path d="M${last.cx + last.w / 2 + 6} ${cy} H${xr} V${y} H${midR}" class="ov-line ov-dashed"/>
                <path d="M${midL} ${y} H${xl} V${cy} H${first.cx - first.w / 2 - 6}" class="ov-line ov-dashed"/>
                <path d="M${first.cx - first.w / 2 - 11} ${cy - 4} L${first.cx - first.w / 2 - 6} ${cy} L${first.cx - first.w / 2 - 11} ${cy + 4}" class="ov-line"/>
                ${text(240, y + 4, row.loop, 'ov-label ov-fig-label')}
                ${rider(path, { dur: 5, cls: 'ov-fill-champ', r: 2.4 })}`;
        }
    });

    out += vArrow(COLS[between.col], 8 + 114 + 2, 146 - 2, between.label, between.side);
    return out;
}

const paperFigures = {
    scope: {
        rows: [
            {
                legend: 'DISCOVERY',
                loop: 'expand graph',
                stages: [
                    { g: 'graph', col: 0, w: 60, label: 'program graph' },
                    { g: 'reversal', col: 1, w: 56, label: 'reversals' },
                    { g: 'llm', col: 2, w: 48, label: 'LLM revise' },
                    { g: 'gate', col: 3, w: 52, label: 'novelty gate' },
                ],
            },
            {
                legend: 'DEPLOYMENT',
                stages: [
                    { g: 'portfolio', col: 3, w: 56, label: 'portfolio' },
                    { g: 'thompson', col: 2, w: 58, label: 'Thompson' },
                    { g: 'workers', col: 1, w: 58, label: 'M workers' },
                    { g: 'incumbent', col: 0, w: 62, label: 'incumbent' },
                ],
            },
        ],
        between: { col: 3, label: 'validate · freeze' },
    },
    motif: {
        rows: [
            {
                legend: 'ROUND 1 · COMPETITION',
                loop: 'backpropagate',
                stages: [
                    { g: 'trees', col: 0, w: 64, label: 'UCB pick πₖ' },
                    { g: 'players', col: 1, w: 60, label: 'two players' },
                    { g: 'operators', col: 2, w: 56, label: 'LLM moves', keys: ['C', 'L', 'I'] },
                    { g: 'duel', col: 3, w: 52, label: 'Δ vs rival' },
                ],
            },
            {
                legend: 'ROUND 2 · SYSTEM REFINEMENT',
                stages: [
                    { g: 'solver', col: 3, w: 60, label: 'full solver' },
                    { g: 'solver', col: 2, w: 60, label: 'revisit πₖ', sweep: true },
                    { g: 'accept', col: 1, w: 52, label: 'dual accept' },
                    { g: 'synergy', col: 0, w: 48, label: 'synergy' },
                ],
            },
        ],
        between: { col: 3, label: 'new baseline' },
    },
    relic: {
        rows: [
            {
                legend: 'PRIVATE SEARCH · PER AGENT',
                loop: 'next batch',
                stages: [
                    { g: 'batch', col: 0, w: 46, label: 'task batch' },
                    { g: 'ucb', col: 1, w: 60, label: 'UCB select' },
                    { g: 'operators', col: 2, w: 56, label: 'LLM operators' },
                    { g: 'team', col: 3, w: 56, label: 'team gain' },
                ],
            },
            {
                legend: 'SHARED PRINCIPLES',
                stages: [
                    { g: 'distill', col: 3, w: 48, label: 'distill' },
                    { g: 'reveal', col: 2, w: 56, label: 'reveal' },
                    { g: 'endorse', col: 1, w: 60, label: 'endorse' },
                    { g: 'prune', col: 0, w: 60, label: 'prune' },
                ],
            },
        ],
        between: { col: 3, label: 'credit' },
    },
};

export function initPaperFigures() {
    const items = document.querySelectorAll('.pub-item[data-figure]');
    if (!items.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver(entries => entries.forEach(entry => {
            const svg = entry.target;
            svg.parentElement.classList.toggle('is-playing', entry.isIntersecting);
            if (entry.isIntersecting) svg.unpauseAnimations?.();
            else svg.pauseAnimations?.();
        }), { rootMargin: '60px 0px' })
        : null;

    items.forEach(item => {
        const spec = paperFigures[item.dataset.figure];
        if (!spec) return;
        const figure = document.createElement('div');
        figure.className = 'ongoing-visual pub-figure';
        figure.setAttribute('aria-hidden', 'true');
        figure.innerHTML = `<svg viewBox="0 0 ${VIEW_W} ${FIG_H}" xmlns="http://www.w3.org/2000/svg">${twoRow(spec)}</svg>`;
        // Outside the card so the card keeps its size; on mobile it follows
        // the card's accordion instead.
        const wrap = document.createElement('div');
        wrap.className = 'pub-figure-wrap is-open';
        wrap.id = `pub-figure-${item.dataset.figure}`;
        const inner = document.createElement('div');
        inner.className = 'pub-figure-inner';
        inner.appendChild(figure);
        wrap.appendChild(inner);
        item.after(wrap);

        // A "Method" button leads the card's tag row; figures start open and
        // the button folds them away or back.
        item.classList.add('has-figure');
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pub-figure-chip';
        chip.setAttribute('aria-controls', wrap.id);
        chip.setAttribute('aria-expanded', 'true');
        chip.setAttribute('aria-label', 'Toggle method figure');
        chip.innerHTML = 'Method<svg viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2 2 6 6 10 2"/></svg>';
        chip.addEventListener('click', () => {
            const open = wrap.classList.toggle('is-open');
            chip.setAttribute('aria-expanded', String(open));
        });
        item.querySelector('.pub-links')?.prepend(chip);

        const svg = figure.firstElementChild;
        if (reduceMotion) {
            svg.pauseAnimations?.();
            svg.setCurrentTime?.(1.6);
        } else if (observer) {
            svg.pauseAnimations?.();
            observer.observe(svg);
        } else {
            figure.classList.add('is-playing');
        }
    });
}
