document.addEventListener("DOMContentLoaded", () => {
    // 1. Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 2. Global Fade-Up Animations
    const fadeElements = gsap.utils.toArray('.fade-up');

    fadeElements.forEach(element => {
        gsap.set(element, { autoAlpha: 0, y: 30 });

        gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    });

    // 3. Automation Nodes Interactive Animation
    const nodes = document.querySelectorAll('.node-item');
    if (nodes.length > 0) {
        // Create a timeline that pulses the nodes in sequence
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

        nodes.forEach((node, index) => {
            tl.to(node, {
                scale: 1.1,
                borderColor: "#60A5FA",
                boxShadow: "0 0 15px rgba(96, 165, 250, 0.4)",
                duration: 0.4,
                ease: "power2.out"
            }, index * 1) // stagger based on index
                .to(node, {
                    scale: 1,
                    borderColor: (index === nodes.length - 1) ? "rgba(96, 165, 250, 0.5)" : "rgba(255,255,255,0.2)",
                    boxShadow: "none",
                    duration: 0.4,
                    ease: "power2.in"
                }, (index * 1) + 0.4);
        });
    }

    // 4. Parallax Effect for CTA Wrapper
    const ctaWrapper = document.querySelector('.auto-cta-wrapper');
    const workflowBox = document.querySelector('.workflow-ui');

    if (ctaWrapper && workflowBox) {
        ctaWrapper.addEventListener('mousemove', (e) => {
            const rect = ctaWrapper.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation
            const rotateY = ((x - centerX) / centerX) * 10; // Max 10 deg
            const rotateX = -((y - centerY) / centerY) * 10;

            gsap.to(workflowBox, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        ctaWrapper.addEventListener('mouseleave', () => {
            // Return to default resting state
            gsap.to(workflowBox, {
                rotateX: 4,
                rotateY: -8,
                duration: 0.8,
                ease: "power3.out"
            });
        });
    }
});