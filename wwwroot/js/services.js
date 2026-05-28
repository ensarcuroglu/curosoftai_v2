/* ============================================================
   curosoftai — Services Page Animations
   GSAP + ScrollTrigger layout.cshtml içinde (defer ile) yüklüdür.
   Bu dosya da defer ile yüklendiği için onlardan sonra çalışır.
   JS yoksa veya reduced-motion ise içerik tam görünür kalır.
   ============================================================ */
(function () {
    "use strict";

    function init() {
        var page = document.querySelector(".services-page");
        if (!page) return;

        // GSAP yüklenmediyse hiçbir şey gizleme — içerik görünür kalsın.
        if (typeof window.gsap === "undefined") return;

        var prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // İçerik artık JS kontrolünde: başlangıç gizli durumlarını CSS aktif etsin.
        page.setAttribute("data-svc-ready", "");

        if (prefersReduced) return; // CSS reduced-motion kuralı içeriği gösterir.

        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        var ease = "power3.out";

        /* ---------- HERO (sayfa yüklenince staggered) ---------- */
        var heroEls = gsap.utils.toArray('[data-svc-anim="hero"]');
        gsap.set(heroEls, { opacity: 0, y: 26 });
        gsap.to(heroEls, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: ease,
            stagger: 0.12,
            delay: 0.15
        });

        /* ---------- Genel fade-in (section başlıkları, CTA) ---------- */
        gsap.utils.toArray('[data-svc-anim="fade"]').forEach(function (el) {
            gsap.set(el, { opacity: 0, y: 30 });
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: ease,
                scrollTrigger: { trigger: el, start: "top 85%" }
            });
        });

        /* ---------- Hizmet kartları (staggered reveal) ---------- */
        var cards = gsap.utils.toArray('[data-svc-anim="card"]');
        gsap.set(cards, { opacity: 0, y: 44 });
        ScrollTrigger.batch(cards, {
            start: "top 88%",
            onEnter: function (batch) {
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: ease,
                    stagger: 0.12,
                    overwrite: true
                });
            }
        });

        /* ---------- Kart hover glow takibi (pointer) ---------- */
        cards.forEach(function (card) {
            card.addEventListener("pointermove", function (e) {
                var r = card.getBoundingClientRect();
                card.style.setProperty("--mx", (e.clientX - r.left) + "px");
                card.style.setProperty("--my", (e.clientY - r.top) + "px");
            });
        });

        /* ---------- Süreç adımları (sıralı reveal) ---------- */
        var steps = gsap.utils.toArray('[data-svc-anim="step"]');
        gsap.set(steps, { opacity: 0, y: 36 });
        gsap.to(steps, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: ease,
            stagger: 0.15,
            scrollTrigger: {
                trigger: ".svc-steps",
                start: "top 78%"
            }
        });

        /* ---------- Süreç bağlantı çizgisi (scroll ile çizilir) ---------- */
        var lineFill = document.querySelector(".svc-steps__line-fill");
        if (lineFill) {
            // CSS, desktop'ta scaleX(0) / mobilde scaleY(0) başlangıcı verir;
            // her iki ekseni de 1'e çekmek iki düzende de doğru çalışır.
            gsap.to(lineFill, {
                scaleX: 1,
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".svc-steps",
                    start: "top 70%",
                    end: "bottom 70%",
                    scrub: 0.6
                }
            });
        }

        /* ---------- Hero glow hafif parallax ---------- */
        var glow = document.querySelector(".svc-hero__glow");
        if (glow) {
            gsap.to(glow, {
                yPercent: 18,
                ease: "none",
                scrollTrigger: {
                    trigger: ".svc-hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // Görseller/yazılar yerleştikten sonra tetikleyici konumlarını tazele.
        ScrollTrigger.refresh();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();