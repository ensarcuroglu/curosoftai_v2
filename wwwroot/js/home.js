/**
 * curosoftai - Home Page Interactions
 * Lightweight, vanilla architecture optimizing client UX and layout animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroEntrance();
    initScrollAnimations();
    initServicesSpotlight();
    initDemoScene();
    initDemoTilt();
    initProcessTimeline();
});

/**
 * GSAP-driven editorial entrance for the hero section.
 * Choreographs status pod → headline line masks → lead → CTA → marker.
 * Honors prefers-reduced-motion.
 */
function initHeroEntrance() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    const lines = hero.querySelectorAll('.hero-line-inner');
    const status = hero.querySelector('[data-hero-anim="status"]');
    const lead = hero.querySelector('[data-hero-anim="lead"]');
    const actions = hero.querySelector('[data-hero-anim="actions"]');
    const marker = hero.querySelector('[data-hero-anim="marker"]');
    const marquee = hero.querySelector('[data-hero-anim="marquee"]'); // YENİ EKLENDİ

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hard fallback if GSAP didn't load — keep everything visible
    if (typeof window.gsap === 'undefined' || reduceMotion) {
        lines.forEach(el => { el.style.transform = 'translateY(0)'; });
        [status, lead, actions, marker, marquee].forEach(el => { // YENİ EKLENDİ
            if (!el) return;
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        delay: 0.15
    });

    tl.to(status, { opacity: 1, y: 0, duration: 0.9 }, 0)
        .to(lines, { y: 0, duration: 1.15, stagger: 0.09 }, 0.15)
        .to(lead, { opacity: 1, y: 0, duration: 1.0 }, '-=0.55')
        .to(actions, { opacity: 1, y: 0, duration: 0.9 }, '-=0.75')
        .to(marker, { opacity: 1, y: 0, duration: 1.0 }, '-=0.7')
        .to(marquee, { opacity: 1, y: 0, duration: 1.2 }, '-=0.8'); // YENİ EKLENDİ
}

/**
 * Modern Intersection Observer tracking elements scrolling into viewpoint 
 * triggering clean CSS Hardware Accelerated transitions.
 */
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.12
        };

        const revealCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop watching once active to optimize resource loops
                    observer.unobserve(entry.target);
                }
            });
        };

        const scrollObserver = new IntersectionObserver(revealCallback, observerOptions);

        revealElements.forEach(element => {
            scrollObserver.observe(element);
        });
    } else {
        // Fallback for deprecated historical browser instances
        revealElements.forEach(element => {
            element.classList.add('visible');
        });
    }
}

/**
 * MVP Demo Scene — choreographed multi-turn AI conversation.
 * Loops a scripted user/bot exchange inside the demo panel:
 *   user bubble → typing dots → bot bubble (word-by-word) → source chips → stat strip swap.
 * Starts when the panel scrolls into view, pauses while the tab is hidden,
 * and skips heavy work on coarse pointers / reduced motion (static seed stays).
 */
function initDemoScene() {
    const scene = document.querySelector('[data-demo-scene]');
    if (!scene) return;

    const track = scene.querySelector('[data-chat-track]');
    const stats = {
        latency:    scene.querySelector('[data-stat="latency"]'),
        sources:    scene.querySelector('[data-stat="sources"]'),
        confidence: scene.querySelector('[data-stat="confidence"]')
    };
    if (!track) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scenario = [
        {
            user: 'Dokümanlarımızı okuyabilen bir asistan kurabiliyor musunuz?',
            bot: 'Evet — RAG mimarimizle dokümanlarınızı indeksleyip kurumsal tonda yanıt veren bir asistan kuruyoruz.',
            sources: [
                { name: 'ürün-katalog.pdf', page: 's.12' },
                { name: 'kvkk-süreç.docx',   page: 's.3'  }
            ],
            stats: { latency: ['1.4', 's'], sources: ['2', 'doküman'], confidence: ['%94', ''] }
        },
        {
            user: 'Çok dilli yanıt verebilir mi?',
            bot: 'Türkçe, İngilizce ve 6 dilde aynı kalitede yanıt üretir. Dili otomatik algılar.',
            sources: [
                { name: 'lokalizasyon-rehberi.pdf', page: 's.7' }
            ],
            stats: { latency: ['0.9', 's'], sources: ['1', 'doküman'], confidence: ['%97', ''] }
        },
        {
            user: 'Yönetim paneliyle içerik güncelleyebilir miyim?',
            bot: 'Mobil uyumlu admin panelinden içerik, SSS ve kaynak dokümanları tek tıkla güncelleyebilirsiniz.',
            sources: [
                { name: 'admin-kullanım.pdf', page: 's.4'  },
                { name: 'içerik-akışı.docx',  page: 's.18' },
                { name: 'sürüm-notları.md',   page: 's.2'  }
            ],
            stats: { latency: ['1.1', 's'], sources: ['3', 'doküman'], confidence: ['%92', ''] }
        }
    ];

    // Timing knobs — reduced motion path runs faster and skips per-word typing
    const T = reduceMotion
        ? { think: 250, wordStep: 0, gap: 1200, after: 900, loopGap: 1400 }
        : { think: 900, wordStep: 38, gap: 650, after: 1100, loopGap: 2600 };

    let stopped = false;
    let started = false;

    function clear() {
        track.replaceChildren();
    }

    function el(tag, cls) {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        return node;
    }

    function addUser(text) {
        const row = el('div', 'chat-row chat-row--user');
        const bubble = el('div', 'chat-bubble chat-bubble--user');
        const p = el('p');
        p.textContent = text;
        bubble.appendChild(p);
        row.appendChild(bubble);
        track.appendChild(row);
        return row;
    }

    function addBotShell() {
        const row = el('div', 'chat-row chat-row--bot');
        const bubble = el('div', 'chat-bubble chat-bubble--bot');
        bubble.dataset.typing = 'dots';
        const p = el('p');
        bubble.appendChild(p);
        row.appendChild(bubble);
        track.appendChild(row);
        return { row, bubble, p };
    }

    function streamWords(bubble, p, text) {
        return new Promise((resolve) => {
            bubble.dataset.typing = 'word';
            const cursor = el('span', 'chat-cursor');
            const words = text.split(' ');
            let i = 0;

            if (reduceMotion) {
                p.textContent = text;
                resolve();
                return;
            }

            p.textContent = '';
            p.appendChild(cursor);

            const tick = () => {
                if (stopped) return resolve();
                if (i >= words.length) {
                    cursor.remove();
                    bubble.removeAttribute('data-typing');
                    return resolve();
                }
                cursor.insertAdjacentText('beforebegin', (i === 0 ? '' : ' ') + words[i]);
                i++;
                setTimeout(tick, T.wordStep);
            };
            setTimeout(tick, 60);
        });
    }

    function addSources(bubble, sources) {
        if (!sources || !sources.length) return;
        const wrap = el('div', 'chat-sources');
        sources.forEach((src) => {
            const chip = el('span', 'chat-source-chip');
            const icon = el('span', 'chip-icon');
            icon.setAttribute('aria-hidden', 'true');
            chip.appendChild(icon);
            chip.appendChild(document.createTextNode(src.name));
            const pg = el('span', 'chip-page');
            pg.textContent = src.page;
            chip.appendChild(pg);
            wrap.appendChild(chip);
        });
        bubble.appendChild(wrap);
    }

    function updateStats(next) {
        if (!next) return;
        ['latency', 'sources', 'confidence'].forEach((key) => {
            const node = stats[key];
            if (!node || !next[key]) return;
            const [value, unit] = next[key];
            const apply = () => {
                node.firstChild ? (node.firstChild.nodeValue = value) : node.appendChild(document.createTextNode(value));
                const unitNode = node.querySelector('.demo-stat-unit');
                if (unitNode) unitNode.textContent = unit;
                else if (unit) {
                    const u = el('span', 'demo-stat-unit');
                    u.textContent = unit;
                    node.appendChild(u);
                }
                node.classList.remove('is-flipping');
            };
            if (reduceMotion) { apply(); return; }
            node.classList.add('is-flipping');
            setTimeout(apply, 220);
        });
    }

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    async function playTurn(turn) {
        if (stopped) return;
        addUser(turn.user);
        await wait(T.think);
        if (stopped) return;
        const { bubble, p } = addBotShell();
        await wait(T.think);
        if (stopped) return;
        bubble.removeAttribute('data-typing');
        await streamWords(bubble, p, turn.bot);
        if (stopped) return;
        addSources(bubble, turn.sources);
        updateStats(turn.stats);
        await wait(T.after);
    }

    async function loop() {
        let i = 0;
        while (!stopped) {
            clear();
            await playTurn(scenario[i % scenario.length]);
            if (stopped) return;
            await wait(T.gap);
            i++;
            if (i % scenario.length === 0) await wait(T.loopGap);
        }
    }

    function start() {
        if (started) return;
        started = true;
        stopped = false;
        loop();
    }

    function pause() {
        stopped = true;
        started = false;
    }

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) start();
                else pause();
            });
        }, { threshold: 0.35 });
        io.observe(scene);
    } else {
        start();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pause();
        else if (scene.getBoundingClientRect().top < window.innerHeight && scene.getBoundingClientRect().bottom > 0) start();
    });
}

/**
 * Subtle 3D tilt for the demo panel — pointermove writes --tilt-x / --tilt-y
 * CSS angle custom properties (declared via @property), enabling buttery
 * GPU-only transitions. Skipped on coarse pointers / reduced motion.
 */
function initDemoTilt() {
    const panel = document.querySelector('[data-demo-tilt]');
    if (!panel) return;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarsePointer || reduceMotion) return;

    const MAX_DEG = 6;
    let frame = 0;
    let nx = 0, ny = 0;

    const apply = () => {
        frame = 0;
        panel.style.setProperty('--tilt-x', nx.toFixed(2) + 'deg');
        panel.style.setProperty('--tilt-y', ny.toFixed(2) + 'deg');
    };

    panel.addEventListener('pointermove', (e) => {
        const rect = panel.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        nx =  cx * MAX_DEG * 2;
        ny = -cy * MAX_DEG * 2;
        if (!frame) frame = requestAnimationFrame(apply);
    });

    panel.addEventListener('pointerleave', () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        nx = 0; ny = 0;
        panel.style.setProperty('--tilt-x', '0deg');
        panel.style.setProperty('--tilt-y', '0deg');
    });
}

/**
 * Process Timeline — scroll-bound vertical rail + milestone activation.
 *
 * Preferred path: GSAP ScrollTrigger scrubs the rail fill height to scroll
 * progress and toggles each milestone's `data-active` as its top crosses the
 * activation line. Falls back to IntersectionObserver if ScrollTrigger isn't
 * available, and finally to a static "all active" state for no-JS or
 * `prefers-reduced-motion` users.
 *
 * The rail starts/ends aligned to the first and last milestone node anchors
 * (not the section edges) so the progress feels honest — the cap reaches the
 * last node exactly when you scroll past it.
 */
function initProcessTimeline() {
    const timeline = document.querySelector('[data-timeline]');
    if (!timeline) return;

    const fill = timeline.querySelector('[data-rail-fill]');
    const cap = timeline.querySelector('[data-rail-cap]');
    const milestones = Array.from(timeline.querySelectorAll('[data-milestone]'));
    if (!fill || !milestones.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setAllActive = () => {
        fill.style.height = '100%';
        milestones.forEach(m => m.setAttribute('data-active', 'true'));
        if (cap) cap.classList.remove('is-active');
    };

    if (reduceMotion) {
        setAllActive();
        return;
    }

    const hasGsap = typeof window.gsap !== 'undefined';
    const hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== 'undefined';

    if (hasScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        // Scroll-bound rail fill — uses the first node as start anchor and
        // the last node as end anchor so progress is calibrated against the
        // actual milestones, not arbitrary section edges.
        const firstNode = milestones[0].querySelector('.timeline-node');
        const lastNode = milestones[milestones.length - 1].querySelector('.timeline-node');

        ScrollTrigger.create({
            trigger: timeline,
            start: () => {
                const rect = firstNode.getBoundingClientRect();
                return (window.scrollY + rect.top) - window.innerHeight * 0.7;
            },
            end: () => {
                const rect = lastNode.getBoundingClientRect();
                return (window.scrollY + rect.bottom) - window.innerHeight * 0.5;
            },
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const p = self.progress;
                fill.style.height = (p * 100) + '%';
                if (cap) {
                    cap.style.top = (p * 100) + '%';
                    cap.classList.toggle('is-active', p > 0.01 && p < 0.999);
                }
            }
        });

        // Activate each milestone when its top crosses the 60% viewport line
        milestones.forEach((m) => {
            ScrollTrigger.create({
                trigger: m,
                start: 'top 65%',
                onEnter: () => m.setAttribute('data-active', 'true'),
                onLeaveBack: () => m.setAttribute('data-active', 'false')
            });
        });

        return;
    }

    // Fallback — no ScrollTrigger available
    if ('IntersectionObserver' in window) {
        const milestoneIo = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.setAttribute('data-active', 'true');
                    milestoneIo.unobserve(e.target);
                }
            });
        }, { threshold: 0.35 });
        milestones.forEach(m => milestoneIo.observe(m));

        // Single-shot rail fill — animates once when timeline scrolls in
        const fillIo = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    fill.style.transition = 'height 2.6s cubic-bezier(0.22, 1, 0.36, 1)';
                    fill.style.height = '100%';
                    if (cap) {
                        cap.classList.add('is-active');
                        cap.style.transition = 'top 2.6s cubic-bezier(0.22, 1, 0.36, 1)';
                        cap.style.top = '100%';
                        setTimeout(() => cap.classList.remove('is-active'), 2700);
                    }
                    fillIo.unobserve(e.target);
                }
            });
        }, { threshold: 0.25 });
        fillIo.observe(timeline);
    } else {
        setAllActive();
    }
}

/**
 * Mouse-tracking spotlight for service cards.
 * Writes pointer position into --mx / --my CSS custom properties on each card
 * so the radial-gradient spotlight follows the cursor smoothly. Coarse pointers
 * (touch devices) and reduced-motion users are skipped to save work.
 */
function initServicesSpotlight() {
    const grid = document.querySelector('[data-services-grid]');
    if (!grid) return;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarsePointer || reduceMotion) return;

    const cards = grid.querySelectorAll('.service-card');
    cards.forEach(card => {
        let frame = 0;
        let pendingX = 0;
        let pendingY = 0;

        const apply = () => {
            frame = 0;
            card.style.setProperty('--mx', pendingX + 'px');
            card.style.setProperty('--my', pendingY + 'px');
        };

        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            pendingX = e.clientX - rect.left;
            pendingY = e.clientY - rect.top;
            if (!frame) frame = requestAnimationFrame(apply);
        });

        card.addEventListener('pointerleave', () => {
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });
    });
}