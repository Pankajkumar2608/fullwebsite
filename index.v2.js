let prevScrollpos = window.pageYOffset;
const siteHeader = document.querySelector(".site-header");
const mainNav = document.getElementById("mainNav"); // Changed var name for clarity
const menuToggle = document.querySelector(".menu-toggle");
const mainNavMenu = document.getElementById("mainNavMenu");


// --- Typing Animation ---
const headlineTarget = document.getElementById('typing-headline-target');
if (headlineTarget) {
    const textToType = headlineTarget.textContent.trim(); // Get text from HTML & trim
    headlineTarget.textContent = ''; // Clear initial text
    let index = 0;
    let isDeleting = false;
    const typingDelay = 100; // Time between typing characters
    const deletingDelay = 50;  // Time between deleting characters
    const pauseDelay = 2000;   // Pause at end of typing/deleting

    function type() {
        const currentWord = textToType; // Using the full original text

        if (isDeleting) {
            headlineTarget.textContent = currentWord.substring(0, index - 1);
            index--;
        } else {
            headlineTarget.textContent = currentWord.substring(0, index + 1);
            index++;
        }

        let delay = isDeleting ? deletingDelay : typingDelay;

        if (!isDeleting && index === currentWord.length) {
            delay = pauseDelay; // Pause after typing
            isDeleting = true;
        } else if (isDeleting && index === 0) {
            delay = pauseDelay / 2; // Shorter pause before re-typing
            isDeleting = false;
        }
        setTimeout(type, delay);
    }
    // Start typing effect only if the target exists
    window.addEventListener('load', () => setTimeout(type, 500));
}

// --- Header Scroll Behavior ---
window.onscroll = function() {
    if (!siteHeader || !mainNav) return;

    let currentScrollPos = window.pageYOffset;

    if (prevScrollpos > currentScrollPos || currentScrollPos < 50) {
        siteHeader.classList.remove("hide");
    } else if (currentScrollPos > 100 && !mainNav.classList.contains('active')) {
        // Only hide if menu is not active
        siteHeader.classList.add("hide");
    }
    prevScrollpos = currentScrollPos;

    if (currentScrollPos > 50) {
        mainNav.classList.add("scrolled");
    } else {
        mainNav.classList.remove("scrolled");
    }
};

// --- Mobile Menu Toggle ---
function toggleMenu() {
    if (mainNav && menuToggle && mainNavMenu) {
        mainNav.classList.toggle("active"); // Toggle on nav element for styles
        const isExpanded = mainNav.classList.contains("active");
        menuToggle.setAttribute('aria-expanded', isExpanded.toString());

        if (isExpanded) {
            siteHeader.classList.remove('hide'); // Ensure header is visible when menu is open
            // Optional: trap focus within menu
        } else {
            // Optional: release focus trap
        }
    }
}

// --- Smooth Scrolling for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === "#" || targetId.length <= 1) return; // Ignore empty or standalone #

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            e.preventDefault();
            let offset = mainNav ? mainNav.offsetHeight : 70; // Default offset if mainNav not found

            if (siteHeader && siteHeader.classList.contains('hide')) {
                // If header is hidden, use a smaller offset or none if it's fully off-screen
                // This depends on how 'hide' class works. Assuming it slides out completely.
                offset = 15; // Small offset for visual comfort
            }

            // Close mobile menu *before* scrolling
            if (mainNav && mainNav.classList.contains('active')) {
                 toggleMenu(); // Use the toggle function to correctly update ARIA too
            }

            // Use timeout to allow menu closing animation to start/finish
            setTimeout(() => {
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
             }, mainNav && mainNav.classList.contains('active') ? 300 : 50); // Longer delay if menu was open
        }
    });
});


// --- Accordion Functionality ---
const accordionHeaders = document.querySelectorAll(".accordion-header");
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        if (!content || !content.classList.contains('accordion-content')) {
            console.warn("Accordion content not found for header:", header);
            return;
        }

        const currentlyExpanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', (!currentlyExpanded).toString());

        if (!currentlyExpanded) {
            // Open accordion
            content.hidden = false; // Make it visible for scrollHeight calculation & CSS styles
            requestAnimationFrame(() => { // Ensure 'hidden' is processed before calculating scrollHeight
                content.style.maxHeight = content.scrollHeight + "px";
                // Opacity and padding transitions are handled by CSS:
                // .accordion-header[aria-expanded="true"] + .accordion-content
            });
        } else {
            // Close accordion
            content.style.maxHeight = '0px';
            // 'hidden' attribute can be re-added after transition for semantics/accessibility,
            // but CSS opacity and max-height=0 effectively hides it.
            // If you use 'hidden', ensure transitionend listener for it.
            // For now, relying on CSS to hide it via max-height and opacity.
            // content.addEventListener('transitionend', () => {
            //     if (header.getAttribute('aria-expanded') === 'false') {
            //        content.hidden = true;
            //     }
            // }, { once: true });
        }
    });
});


// --- Anime.js Animations (with existence checks) ---
const GLOBAL_CFG = {
    loop: true,
    // Consider adding a global easing or let individual animations define it
    // easing: 'easeInOutSine'
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to check if element exists for anime.js
function animateIfExists(selector, options) {
    const element = document.querySelector(selector);
    const elements = document.querySelectorAll(selector); // For collections

    if (elements.length > 1) { // Handle collections
        if (elements.length > 0) {
            anime({ ...GLOBAL_CFG, targets: elements, ...options });
        }
    } else if (element) { // Handle single element
        anime({ ...GLOBAL_CFG, targets: selector, ...options });
    }
}
function animateCollectionIfExists(selector, individualOptionsFn) {
    const collection = document.querySelectorAll(selector);
    if (collection.length > 0) {
        collection.forEach((el, index) => {
            anime({
                ...GLOBAL_CFG,
                targets: el,
                ...(individualOptionsFn ? individualOptionsFn(el, index) : {})
            });
        });
    }
}

animateCollectionIfExists('.swet', (el, index) => ({
    opacity: [0, 1, 0],
    delay: index * 100,
    duration: index * 1500 + 1000, // Ensure some minimum duration
    translateY: index * 2,
    easing: 'easeInOutSine'
}));

animateCollectionIfExists('.spit', (el, index) => ({
    opacity: [0, 1, 0],
    delay: 500 + index * 50, // Stagger delay slightly
    duration: (index + 1) * 1000 + 500,
    translateY: getRndInteger(-30, 30),
    translateX: getRndInteger(-30, 30),
    easing: 'easeInOutSine'
}));

animateCollectionIfExists('.debre', (el, index) => ({
    opacity: [0, 1, 0],
    delay: index * 100,
    duration: (index + 1) * 100 + 500,
    scaleX: 1.3,
    scaleY: 1.3,
    translateY: getRndInteger(-10, -40),
    translateX: getRndInteger(-30, 30),
    easing: 'linear'
}));

animateIfExists('#gear1 path', { rotate: 360, easing: 'linear', duration: 5000 });
animateIfExists('#gear2 path', { rotate: -360, easing: 'linear', duration: 5000 });

animateIfExists('#shortArrow', {
    rotate: 360, duration: 10000, easing: 'linear',
    transformOrigin: ['4px 25px 0', '6px 27px 0'] // Make sure this is correct for your SVG
});
animateIfExists('#longArrow', {
    rotate: 360, duration: 8000, easing: 'linear', // Slowed down slightly
    transformOrigin: ['2px 32px 0', '10px 39px 0'] // Make sure this is correct
});

animateIfExists('#leftHand', {
    rotate: 4, duration: 1200, direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['10px 39px 0', '10px 39px 0'] // Adjusted for consistency example
});
animateIfExists('#leftPalm', {
    translateX: -8, duration: 1200, direction: 'alternate', easing: 'easeInOutSine',
});

animateIfExists('#rightHand', {
    rotate: 4, duration: 700, direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['280px 120px 0', '280px 120px 0']
});
animateIfExists('#rightPalm', {
    rotate: 4, translateX: '-10px', translateY: '-3px', duration: 700,
    direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['30px 30px 0', '30px 30px 0']
});
animateIfExists('#pen', {
    rotate: 5, translateX: '-10px', translateY: '-3px', duration: 700,
    direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['30px 30px 0', '30px 30px 0']
});

animateIfExists('#mounth', { // mouth, not mounth
    scaleX: 1.05, scaleY: [1.1, .95], duration: 1800, direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['center center 0'] // Use center if not specific
});
animateIfExists('#tongue', {
    rotate: -3, scaleX: 1.1, scaleY: [1.05, .8], duration: 1800,
    direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['center 10px 0'] // Example
});

animateIfExists('#head', {
    rotate: -2, duration: 2000, direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['center bottom 0'] // Example: rotate around neck
});
animateIfExists('#hair1', {
    rotate: -1.5, duration: 2000, direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['center bottom 0']
});
animateIfExists('#hair2', {
    rotate: -2, duration: 2000, direction: 'alternate', easing: 'easeInOutSine',
    transformOrigin: ['center bottom 0']
});

animateIfExists('#brows', {
    translateY: -2, duration: 800, direction: 'alternate', easing: 'easeInOutSine', // Simpler brow animation
});

animateIfExists('#leftEye', {
    duration: 3000, scaleY: [.1, 1], delay: anime.stagger(100, {start: 500}), easing: 'easeInOutSine',
    transformOrigin: 'center center'
});
animateIfExists('#rghtEye', { // rightEye
    duration: 3000, scaleY: [.1, 1], delay: anime.stagger(100, {start: 600}), easing: 'easeInOutSine',
    transformOrigin: 'center center'
});

animateIfExists('#flash1', {
    duration: getRndInteger(400, 600), scale: [.6, 1, 0.6], // Scale anim
    rotate: getRndInteger(-4, 4), opacity: [0, .7, 0], easing: 'easeInOutSine',
});
animateIfExists('#flash2', {
    delay: 500, duration: getRndInteger(400, 600), scale: [.6, 1, 0.6],
    rotate: getRndInteger(-4, 4), opacity: [0, .7, 0], easing: 'easeInOutSine',
});

animateIfExists('#whiteFlash1', {
    duration: 1000, opacity: [0, 0.9, 0.7, 0.7, 0], easing: 'easeOutQuint',
});
animateIfExists('#whiteFlash2', {
    duration: 900, delay: 200, opacity: [0, .6, 0], easing: 'linear',
});

animateIfExists('#paper1', {
    delay: 500, duration: 3500,
    scale: [0, .6, 0], // Combined scale
    translateX: ['-150%', '50%'], // Fly across more
    translateY: ['-100%', '20%'],
    rotate: getRndInteger(-400, -100),
    opacity: [0.3, .7, 0],
    easing: 'cubicBezier(.09,.69,.48,1)', // Custom ease
});


// --- Dynamic Year Update ---
const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}