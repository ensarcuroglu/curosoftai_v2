/* ============================================================================
 *  curosoftai — "AI Çözümler"  ·  Minimalist Executive · Particle Scrollytelling
 *  Modern Three.js (ESM, r170) + GSAP ScrollTrigger
 *
 *  MİMARİ: Tek bir THREE.Points (30.000 parçacık, tek BufferGeometry, tek draw
 *  call). 6 aşamanın TÜM formları (çekirdek/bulut/grid/bloklar/kalkan/zemin)
 *  her parçacık için ÖNCEDEN hesaplanmış 6 hedef pozisyon olarak GPU'ya yüklenir.
 *  Geçiş = vertex shader'da `uMorph` (0..5) uniform'u ile zincirlenmiş mix().
 *  GSAP yalnız `uMorph.value`'yu scrub eder; requestAnimationFrame YALNIZCA
 *  `uTime`'ı günceller ve render eder → kare başına minimum matematik.
 *
 *  Ağır materyal/post-processing YOK: MeshPhysicalMaterial, transmission, IOR,
 *  EffectComposer, UnrealBloom, Bokeh — tamamı kaldırıldı.
 *
 *  Palet "Minimalist Executive": Siyah zemin · Krem/Kahve parçacıklar · Beyaz
 *  vurgular (additive glow). pixelRatio ≤ 1.5.
 *
 *  6 AŞAMA: 0 çekirdek(merkez) · 1 bulut(sol) · 2 grid(sağ) · 3 bloklar(merkez)
 *           · 4 kalkan(sol) · 5 zemin/dalga(merkez).
 *  B2B metinleri + GSAP kelime-kelime reveal koreografisi KORUNDU.
 * ========================================================================== */

import * as THREE from 'three';

(function () {
    'use strict';

    const canvas = document.getElementById('ai-solutions-canvas');
    if (!canvas) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const hasGSAP = !!(gsap && ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const TAU = Math.PI * 2;
    const GOLDEN = Math.PI * (1 + Math.sqrt(5));   // altın açı (Fibonacci küre)

    // --- Yapılandırma ----------------------------------------------------------
    const CONFIG = {
        count: reducedMotion ? 14000 : 30000,
        pixelRatioCap: 1.5,                // yüksek-DPI ekranlarda kasılmayı engelle
        bg: 0x060504,                      // sıcak siyah zemin
        size: 26.0,                        // taban parçacık boyutu (perspektifle ölçeklenir)
        opacity: reducedMotion ? 0.7 : 0.62,
        // "Minimalist Executive" paleti — sRGB 0-255 + ağırlık (krem/kahve/beyaz)
        palette: [
            { c: [234, 217, 184], w: 22 },  // açık krem
            { c: [216, 193, 154], w: 20 },  // krem
            { c: [199, 170, 128], w: 14 },  // kum
            { c: [138, 106, 66], w: 18 },  // orta kahve
            { c: [94, 68, 40], w: 12 },  // koyu kahve
            { c: [243, 234, 217], w: 9 },   // kırık beyaz
            { c: [255, 255, 255], w: 5 }    // beyaz vurgu (seyrek)
        ]
    };

    // --- Modül durumu ----------------------------------------------------------
    let renderer, scene, camera, clock;
    let points, pointsGeo, pointsMat;
    let rafId = null, disposed = false;

    let stageRailEl = null, stageRailItems = [];

    const pointer = new THREE.Vector2(0, 0);
    const pointerEased = new THREE.Vector2(0, 0);
    // Kamera "rig"i — GSAP scrub eder (aşamaya göre açı/çerçeveleme); rAF uygular.
    const camState = { posX: 0, posY: 0.4, posZ: 9, tgtX: 0, tgtY: 0, tgtZ: 0 };

    // --- Yardımcılar -----------------------------------------------------------
    const rand = (a, b) => a + Math.random() * (b - a);
    const lerp = (a, b, t) => a + (b - a) * t;

    /** Ağırlıklı palet seçimi → küçük parlaklık jitter'ı ile organik varyasyon. */
    let _palTotal = 0;
    CONFIG.palette.forEach((p) => { _palTotal += p.w; });
    function pickColor(out, o) {
        let r = Math.random() * _palTotal;
        let chosen = CONFIG.palette[0].c;
        for (let k = 0; k < CONFIG.palette.length; k++) {
            r -= CONFIG.palette[k].w;
            if (r <= 0) { chosen = CONFIG.palette[k].c; break; }
        }
        const j = rand(0.82, 1.10);                 // parlaklık varyasyonu
        out[o] = Math.min(1, chosen[0] / 255 * j);
        out[o + 1] = Math.min(1, chosen[1] / 255 * j);
        out[o + 2] = Math.min(1, chosen[2] / 255 * j);
    }

    /** Birim küre üzerinde rastgele yön (yoğun hacim için cbrt yarıçapla kullan). */
    function randDir(out) {
        const u = Math.random() * 2 - 1;            // cos(phi)
        const th = Math.random() * TAU;
        const sp = Math.sqrt(1 - u * u);
        out.x = sp * Math.cos(th); out.y = u; out.z = sp * Math.sin(th);
    }

    // ==========================================================================
    //  PARÇACIK SİSTEMİ — 6 hedef formu önceden hesapla, tek geometriye yükle
    // ==========================================================================
    function buildParticles() {
        const N = CONFIG.count;
        const p0 = new Float32Array(N * 3);   // 0 · çekirdek (= position attribute)
        const p1 = new Float32Array(N * 3);   // 1 · bulut/galaksi (sol)
        const p2 = new Float32Array(N * 3);   // 2 · grid/matris (sağ)
        const p3 = new Float32Array(N * 3);   // 3 · modüler bloklar (merkez)
        const p4 = new Float32Array(N * 3);   // 4 · kalkan + iç çekirdek (sol)
        const p5 = new Float32Array(N * 3);   // 5 · dalga zemin (merkez)
        const col = new Float32Array(N * 3);
        const seed = new Float32Array(N);
        const size = new Float32Array(N);

        const dir = new THREE.Vector3();

        // Grid (aşama 3) için kübik kafes boyutu
        const G = Math.max(2, Math.round(Math.cbrt(N)));   // ~31
        const gridS = 0.14, gridOX = 3.0;

        for (let i = 0; i < N; i++) {
            const o = i * 3;

            // ---- 0 · ÇEKİRDEK: yoğun küre (merkez) ----
            {
                const r = 1.9 * Math.cbrt(Math.random());
                randDir(dir);
                p0[o] = dir.x * r; p0[o + 1] = dir.y * r; p0[o + 2] = dir.z * r;
            }

            // ---- 1 · AĞ/GALAKSİ: HACİMLİ 3B sarmal (sol) — açılı kamerayla derinlik ----
            {
                const t = Math.random();
                const rr = Math.pow(t, 0.5) * 3.4;
                const arm = (i % 3) / 3 * TAU;
                const ang = arm + rr * 0.8 + (Math.random() - 0.5) * 0.9;
                // Gerçek yükseklik + z-derinliği (yassı disk DEĞİL → 3B ağ)
                p1[o] = Math.cos(ang) * rr - 3.0;
                p1[o + 1] = (Math.random() - 0.5) * 2.4 * (0.45 + 0.55 * (1 - rr / 3.4));
                p1[o + 2] = Math.sin(ang) * rr + (Math.random() - 0.5) * 0.6;
            }

            // ---- 2 · GRID/MATRİS: keskin 3B kübik kafes (sağ) ----
            {
                const ix = i % G;
                const iy = Math.floor(i / G) % G;
                const iz = Math.floor(i / (G * G)) % G;   // %G → taşan noktalar düğümlere katlanır
                p2[o] = (ix - (G - 1) / 2) * gridS + gridOX;
                p2[o + 1] = (iy - (G - 1) / 2) * gridS;
                p2[o + 2] = (iz - (G - 1) / 2) * gridS;
            }

            // ---- 3 · BLOKLAR: 8 küp SAĞA/SOLA ayrılır, MERKEZ tamamen boş (metne yer) ----
            {
                const b = i % 8;                          // 0..7
                const side = (b < 4) ? -1 : 1;            // 0-3 sol, 4-7 sağ
                const li = b % 4;
                const lcol = li % 2, lrow = (li / 2) | 0; // her yanda 2×2 küp
                const half = 0.5;
                const cx = side * 4.2 + (lcol - 0.5) * 1.35;
                const cy = (lrow - 0.5) * 1.7;
                const cz = (lcol - 0.5) * 0.8;            // hafif derinlik
                p3[o] = cx + (Math.random() - 0.5) * 2 * half;
                p3[o + 1] = cy + (Math.random() - 0.5) * 2 * half;
                p3[o + 2] = cz + (Math.random() - 0.5) * 2 * half;
            }

            // ---- 4 · KALKAN: %70 içi boş küre kabuğu + %30 sabit iç çekirdek (sol) ----
            {
                if ((i % 10) < 7) {
                    const tt = (i + 0.5) / N;
                    const phi = Math.acos(1 - 2 * tt);
                    const theta = GOLDEN * i;
                    const R = 2.7, sp = Math.sin(phi);
                    p4[o] = R * sp * Math.cos(theta) - 3.0;
                    p4[o + 1] = R * Math.cos(phi);
                    p4[o + 2] = R * sp * Math.sin(theta);
                } else {
                    const r = 0.85 * Math.cbrt(Math.random());
                    randDir(dir);
                    p4[o] = dir.x * r - 3.0;
                    p4[o + 1] = dir.y * r;
                    p4[o + 2] = dir.z * r;
                }
            }

            // ---- 5 · ZEMİN: geniş yatay düzlem (dalga shader'da eklenir, merkez) ----
            {
                p5[o] = (Math.random() - 0.5) * 15.0;
                p5[o + 1] = -2.7 + (Math.random() - 0.5) * 0.1;
                p5[o + 2] = (Math.random() - 0.5) * 10.0 - 1.0;
            }

            pickColor(col, o);
            seed[i] = Math.random();
            size[i] = rand(0.6, 1.4) * (Math.random() < 0.04 ? 2.0 : 1.0);  // seyrek "kıvılcım"
        }

        pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute('position', new THREE.BufferAttribute(p0, 3));   // p0 = çekirdek
        pointsGeo.setAttribute('aPos1', new THREE.BufferAttribute(p1, 3));
        pointsGeo.setAttribute('aPos2', new THREE.BufferAttribute(p2, 3));
        pointsGeo.setAttribute('aPos3', new THREE.BufferAttribute(p3, 3));
        pointsGeo.setAttribute('aPos4', new THREE.BufferAttribute(p4, 3));
        pointsGeo.setAttribute('aPos5', new THREE.BufferAttribute(p5, 3));
        pointsGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
        pointsGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
        pointsGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
        pointsGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 30);

        pointsMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMorph: { value: 0 },           // 0..5 — GSAP scrub eder
                uSize: { value: CONFIG.size },
                uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioCap) },
                uOpacity: { value: CONFIG.opacity }
            },
            vertexShader: `
                uniform float uTime, uMorph, uSize, uPixelRatio;
                attribute vec3 aPos1, aPos2, aPos3, aPos4, aPos5;
                attribute vec3 aColor;
                attribute float aSeed, aSize;
                varying vec3 vColor;
                varying float vFade;

                void main() {
                    // Zincirlenmiş morph: ardışık formlar arasında parçalı-doğrusal geçiş.
                    vec3 p = position;
                    p = mix(p, aPos1, clamp(uMorph,       0.0, 1.0));
                    p = mix(p, aPos2, clamp(uMorph - 1.0, 0.0, 1.0));
                    p = mix(p, aPos3, clamp(uMorph - 2.0, 0.0, 1.0));
                    p = mix(p, aPos4, clamp(uMorph - 3.0, 0.0, 1.0));
                    p = mix(p, aPos5, clamp(uMorph - 4.0, 0.0, 1.0));

                    // Aşama ağırlıkları (ucuz)
                    float wCore   = 1.0 - clamp(uMorph, 0.0, 1.0);              // çekirdek
                    float wBlocks = 1.0 - clamp(abs(uMorph - 3.0), 0.0, 1.0);  // bloklar
                    float wFloor  = clamp(uMorph - 4.0, 0.0, 1.0);             // zemin/dalga

                    // Çekirdek: nefes + yerinde Y dönüşü (merkezde olduğu için yerinde döner)
                    p *= 1.0 + sin(uTime * 0.8) * 0.04 * wCore;
                    float ang = uTime * 0.12 * wCore;
                    float s = sin(ang), c = cos(ang);
                    p.xz = mat2(c, -s, s, c) * p.xz;

                    // Bloklar: bağımsız ama ahenkli salınım
                    p.x += sin(uTime * 0.8 + aSeed * 6.2831) * 0.10 * wBlocks;
                    p.y += cos(uTime * 0.7 + aSeed * 5.0)    * 0.10 * wBlocks;

                    // Zemin: sakin deniz dalgası
                    p.y += sin(p.x * 0.6 + uTime * 0.9) * cos(p.z * 0.55 + uTime * 0.7) * 0.5 * wFloor;

                    vec4 mv = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mv;
                    gl_PointSize = uSize * aSize * uPixelRatio / max(0.1, -mv.z);

                    vColor = aColor;
                    vFade = clamp((16.0 + mv.z) / 14.0, 0.3, 1.0);   // yakın = parlak (derinlik)
                }
            `,
            fragmentShader: `
                uniform float uOpacity;
                varying vec3 vColor;
                varying float vFade;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    float a = smoothstep(0.5, 0.08, d);     // yumuşak yuvarlak nokta
                    if (a < 0.01) discard;
                    gl_FragColor = vec4(vColor, a * uOpacity * vFade);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,   // krem/beyaz = ışık/glow (siyah zeminde)
            depthTest: false,
            depthWrite: false
        });

        points = new THREE.Points(pointsGeo, pointsMat);
        points.frustumCulled = false;           // morph ile uzağa gider → culling kapalı
        scene.add(points);
    }

    // ==========================================================================
    //  SAHNE / RENDERER / KAMERA  (tonemap/post-processing YOK)
    // ==========================================================================
    function initScene() {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: !reducedMotion, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioCap));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        renderer.setClearColor(CONFIG.bg, 1);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0.4, 9);
        camera.lookAt(0, 0, 0);
        clock = new THREE.Clock();
    }

    // ==========================================================================
    //  GSAP — TEK MASTER TIMELINE: uMorph 0→5 (scrub). Kare başına iş YOK.
    // ==========================================================================
    function initScrollTriggers() {
        if (!hasGSAP) {
            console.warn('[AI Çözümler] GSAP yok; statik çekirdek gösteriliyor.');
            return;
        }
        gsap.registerPlugin(ScrollTrigger);
        const uMorph = pointsMat.uniforms.uMorph;
        const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: {
                trigger: '#intro', start: 'top top',
                endTrigger: '#vision', end: 'bottom bottom',
                scrub: reducedMotion ? true : 1.1,
                onUpdate: (self) => {
                    if (stageRailEl) stageRailEl.style.setProperty('--aic-progress', (self.progress * 100).toFixed(2) + '%');
                }
            }
        });
        // Her aşamada uMorph + kamera çerçevelemesi BİRLİKTE tween'lenir ('<' = eş zamanlı).
        // Kamera açıları metin tarafının karşısına objeyi yerleştirir + derinlik verir.
        tl.to({}, { duration: 0.2 });                                                       // 0 · hero (merkez)
        tl.to(uMorph, { value: 1, duration: 0.9 });                                         // → 01 ağ (sol)
        tl.to(camState, { posX: 1.4, posY: 2.8, posZ: 7.6, tgtX: -0.8, tgtY: 0.0, duration: 0.9 }, '<');  // açılı/iso → 3B derinlik
        tl.to({}, { duration: 0.3 });
        tl.to(uMorph, { value: 2, duration: 0.9 });                                         // → 02 grid (sağ)
        tl.to(camState, { posX: -1.2, posY: 0.8, posZ: 8.4, tgtX: 0.7, tgtY: 0.0, duration: 0.9 }, '<');
        tl.to({}, { duration: 0.3 });
        tl.to(uMorph, { value: 3, duration: 0.9 });                                         // → 03 bloklar (sağ+sol, merkez boş)
        tl.to(camState, { posX: 0.0, posY: 0.5, posZ: 10.2, tgtX: 0.0, tgtY: 0.0, duration: 0.9 }, '<'); // geri çekil, merkez boş kalsın
        tl.to({}, { duration: 0.3 });
        tl.to(uMorph, { value: 4, duration: 0.9 });                                         // → 04 kalkan (sol)
        tl.to(camState, { posX: 1.2, posY: 0.5, posZ: 9.0, tgtX: -0.5, tgtY: 0.0, duration: 0.9 }, '<');
        tl.to({}, { duration: 0.3 });
        tl.to(uMorph, { value: 5, duration: 0.9 });                                         // → 05 zemin/dalga (merkez CTA)
        tl.to(camState, { posX: 0.0, posY: 0.2, posZ: 10.0, tgtX: 0.0, tgtY: -0.8, duration: 0.9 }, '<'); // aşağı bak → dalga zeminle bütünleş
    }

    // ==========================================================================
    //  GSAP — İÇERİK KOREOGRAFİSİ (maskeli kelime reveal + clip-path) — KORUNDU
    // ==========================================================================
    function splitWords(el) {
        const text = el.textContent;
        el.textContent = '';
        const frag = document.createDocumentFragment();
        const inners = [];
        text.split(/(\s+)/).forEach((token) => {
            if (token === '') return;
            if (/^\s+$/.test(token)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'rw';
            const wi = document.createElement('span'); wi.className = 'rw-i'; wi.textContent = token;
            w.appendChild(wi); frag.appendChild(w); inners.push(wi);
        });
        el.appendChild(frag);
        return inners;
    }

    function setActiveStage(idx) {
        for (let i = 0; i < stageRailItems.length; i++) {
            stageRailItems[i].classList.toggle('active', i === idx);
        }
    }

    function initContentAnimations() {
        const sections = Array.prototype.slice.call(document.querySelectorAll('.scene-section'));

        // GSAP yok / hareket azaltıldı / bölüm yok → içerik kalıcı GÖRÜNÜR kalsın
        // (erişilebilir fallback; FOUC gizleme katmanını kaldırıyoruz).
        if (!hasGSAP || reducedMotion || sections.length === 0) {
            document.documentElement.classList.remove('aicore-anim');
            setActiveStage(0);
            return;
        }

        // Jenerik reveal: ilk öğe (eyebrow/indeks) → başlık kelimeleri → kalan öğeler.
        const isLede = (el) => el.classList.contains('lede');
        const hiddenState = (el) => isLede(el)
            ? { clipPath: 'inset(0% 0% 100% 0%)', y: 14, opacity: 0 }
            : { y: 16, opacity: 0 };
        const shownState = (el) => isLede(el)
            ? { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
            : { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' };

        // Bir sahneyi göster/gizle. KÖK ÇÖZÜM: görünürlük TEK kaynaktan
        // (ScrollTrigger.isActive) belirlenir; aşağı→yukarı→aşağı gibi yön
        // değişimlerinde veya refresh sonrası metin "takılı gizli" kalamaz.
        const revealScene = (scene) => {
            gsap.set(scene.box, { y: 0 });
            scene.tl.restart();
            scene.shown = true;
        };
        const hideScene = (scene, dir) => {
            gsap.to(scene.box, {
                opacity: 0, y: -28 * (dir || 1), duration: 0.5,
                ease: 'power2.inOut', overwrite: true
            });
            scene.shown = false;
        };

        const scenes = [];
        sections.forEach((section, idx) => {
            const box = section.querySelector('.scene-content');
            if (!box) { scenes.push(null); return; }

            const heading = box.querySelector('[data-reveal-heading]');
            const words = heading ? splitWords(heading) : [];
            const items = Array.prototype.slice.call(box.querySelectorAll('[data-reveal-item]'));
            const first = items[0] || null;          // eyebrow / indeks satırı
            const rest = items.slice(1);             // lede · status · cta ...

            // Tekrar oynatılabilir reveal zaman çizelgesi (paused).
            const tl = gsap.timeline({ paused: true });
            tl.set(box, { opacity: 1, y: 0 });
            if (first) tl.fromTo(first, { y: 18, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.0);
            if (words.length) tl.fromTo(words, { yPercent: 115, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.045, ease: 'power4.out' }, 0.15);
            rest.forEach((el, k) => tl.fromTo(el, hiddenState(el), shownState(el), 0.42 + k * 0.13));

            const scene = { box, tl, shown: false, st: null };

            // Başlangıç gizli durumu — inline yazılır; FOUC CSS katmanı kaldırılınca da
            // gizli kalır (görünürlüğü artık yalnızca GSAP inline stilleri yönetir).
            gsap.set(box, { opacity: 0 });
            if (first) gsap.set(first, { y: 18, opacity: 0 });
            if (words.length) gsap.set(words, { yPercent: 115, opacity: 0 });
            rest.forEach((el) => gsap.set(el, hiddenState(el)));

            // Dört ayrı geri-çağrı (onEnter/onLeave/...) yerine TEK onToggle:
            // isActive → göster, değilse → gizle. Desenkron olamaz.
            scene.st = ScrollTrigger.create({
                trigger: section, start: 'top 72%', end: 'bottom 28%',
                onToggle: (self) => {
                    if (self.isActive) { setActiveStage(idx); revealScene(scene); }
                    else { hideScene(scene, self.direction); }
                }
            });

            scenes.push(scene);
        });

        // FOUC katmanını kaldır: içerik artık inline stillerle gizli; CSS tabanı GÖRÜNÜR.
        // Beklenmedik bir durumda (kaçan tetikleyici vb.) metin görünür kalır, kaybolmaz.
        document.documentElement.classList.remove('aicore-anim');

        // Kaydırma ipucu (yalnız ilk bölümde) — kaydırınca yumuşakça söner.
        const hint = document.querySelector('.scroll-hint');
        if (hint) {
            ScrollTrigger.create({
                trigger: '#intro', start: 'top top', end: 'bottom 55%',
                onUpdate: (self) => gsap.set(hint, { opacity: 1 - self.progress, overwrite: true })
            });
        }

        ScrollTrigger.refresh();

        // Başlangıç/refresh sonrası durum uzlaştırma: o an görünürdeki bölüm(ler)i aç.
        // onToggle ilk yüklemede tetiklenmese bile görünür bölüm güvenle açılır.
        let anyShown = false;
        scenes.forEach((scene, idx) => {
            if (!scene) return;
            if (scene.st.isActive && !scene.shown) { setActiveStage(idx); revealScene(scene); }
            if (scene.shown) anyShown = true;
        });
        if (!anyShown) setActiveStage(0);
    }

    // ==========================================================================
    //  ANA DÖNGÜ — yalnız uTime güncelle + render (minimum matematik)
    // ==========================================================================
    function animate() {
        rafId = requestAnimationFrame(animate);
        pointsMat.uniforms.uTime.value = reducedMotion ? 0 : clock.getElapsedTime();

        // Çok hafif paralaks (2 lerp) → GSAP'in scrub ettiği kamera açısının üstüne biner.
        if (!reducedMotion) {
            pointerEased.x += (pointer.x - pointerEased.x) * 0.04;
            pointerEased.y += (pointer.y - pointerEased.y) * 0.04;
        }
        camera.position.set(
            camState.posX + pointerEased.x * 0.45,
            camState.posY + pointerEased.y * 0.30,
            camState.posZ
        );
        camera.lookAt(camState.tgtX, camState.tgtY, camState.tgtZ);
        renderer.render(scene, camera);
    }

    // ==========================================================================
    //  OLAY DİNLEYİCİLERİ
    // ==========================================================================
    function onResize() {
        if (!renderer || !camera) return;
        const w = window.innerWidth, h = window.innerHeight;
        const pr = Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioCap);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(pr);
        renderer.setSize(w, h, false);
        if (pointsMat) pointsMat.uniforms.uPixelRatio.value = pr;
        if (hasGSAP) ScrollTrigger.refresh();
    }

    function onPointerMove(e) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    // ==========================================================================
    //  BELLEK YÖNETİMİ — dispose
    // ==========================================================================
    function dispose() {
        if (disposed) return;
        disposed = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pagehide', dispose);
        window.removeEventListener('beforeunload', dispose);
        if (hasGSAP) ScrollTrigger.getAll().forEach((t) => t.kill());

        if (pointsGeo) pointsGeo.dispose();
        if (pointsMat) pointsMat.dispose();
        if (renderer) {
            renderer.dispose();
            if (renderer.forceContextLoss) renderer.forceContextLoss();
        }
    }

    // ==========================================================================
    //  BAŞLAT
    // ==========================================================================
    function init() {
        try {
            stageRailEl = document.querySelector('.stage-rail');
            stageRailItems = Array.prototype.slice.call(document.querySelectorAll('.stage-rail-list li'));

            initScene();
            buildParticles();
            initScrollTriggers();
            initContentAnimations();
            document.documentElement.classList.add('aicore-ready');

            window.addEventListener('resize', onResize);
            window.addEventListener('pointermove', onPointerMove, { passive: true });
            window.addEventListener('pagehide', dispose);
            window.addEventListener('beforeunload', dispose);

            animate();
            window.__aiSolutions = { CONFIG, dispose, renderer, scene, camera, camState, points, pointsMat };
        } catch (err) {
            console.error('[AI Çözümler] Başlatma hatası:', err);
            document.documentElement.classList.remove('aicore-anim');   // metinleri görünür kıl
            dispose();
        }
    }

    init();
})();
