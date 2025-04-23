let prevScrollpos = window.pageYOffset;
const siteHeader = document.querySelector(".site-header"); // Target header element
const navBar = document.getElementById("mainNav"); // Still needed for offset calculation
const menuToggle = document.querySelector(".menu-toggle"); // Target toggle button


const headlineTarget = document.getElementById('typing-headline-target');
if (headlineTarget) {
    const textToType = headlineTarget.textContent; // Get text from HTML
    headlineTarget.textContent = ''; // Clear initial text
    let index = 0;
    let isDeleting = false;

    function type() {
        const currentText = headlineTarget.textContent;
        const fullText = textToType; // Use original text

        if (!isDeleting && index < fullText.length) {
            headlineTarget.textContent = fullText.substring(0, index + 1);
            index++;
        } else if (isDeleting && index > 0) {
            headlineTarget.textContent = fullText.substring(0, index - 1);
            index--;
        }

        let typingSpeed = 80;
        // If finished typing or finished deleting
        if ((!isDeleting && index === fullText.length) || (isDeleting && index === 0)) {
            typingSpeed = 1500; // Pause longer at the end and beginning
            isDeleting = !isDeleting; // Switch mode
        } else if (isDeleting) {
             typingSpeed = 50; // Delete faster
        }


        setTimeout(type, typingSpeed);
    }
    // Start typing effect only if the target exists
    window.addEventListener('load', () => setTimeout(type, 500)); // Add a small delay
}


window.onscroll = function() {
    if (!siteHeader) return; // Exit if header doesn't exist

    let currentScrollPos = window.pageYOffset;

    // Show if scrolling up or near top
    if (prevScrollpos > currentScrollPos || currentScrollPos < 50) {
        siteHeader.classList.remove("hide");
    }
    // Hide only if scrolling down past a threshold and menu isn't open
    else if (currentScrollPos > 100 && !navBar.classList.contains('active')) {
        siteHeader.classList.add("hide");
    }
    prevScrollpos = currentScrollPos;

    // Add 'scrolled' class for background change
    if (navBar) { // Check if navBar exists
         if (currentScrollPos > 50) {
             navBar.classList.add("scrolled");
         } else {
             navBar.classList.remove("scrolled");
         }
    }
};

function toggleMenu() {
    if (navBar && menuToggle) {
        navBar.classList.toggle("active"); // Use 'active' class consistent with CSS
        const isExpanded = navBar.classList.contains("active");
        menuToggle.setAttribute('aria-expanded', isExpanded);

        // Prevent hiding the header while the menu is open
        if (isExpanded && siteHeader) {
            siteHeader.classList.remove('hide');
        }
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        try { // Add try-catch for robustness
            const targetElement = document.querySelector(targetId);

            if (targetElement && navBar) {
                let offset = navBar.offsetHeight;
                 // If nav is hidden, don't subtract its height (or subtract less)
                if (siteHeader && siteHeader.classList.contains('hide')) {
                    offset = 10; // Small offset when nav is hidden
                }

                // Close mobile menu *before* scrolling
                if (navBar.classList.contains('active')) {
                     navBar.classList.remove("active");
                     if (menuToggle) {
                         menuToggle.setAttribute('aria-expanded', 'false');
                     }
                }

                // Use timeout to allow menu closing animation to start
                setTimeout(() => {
                    window.scrollTo({
                        top: targetElement.offsetTop - offset,
                        behavior: 'smooth'
                    });
                 }, 100); // Small delay
            }
        } catch (error) {
            console.error("Error finding or scrolling to element:", error);
        }
    });
});

const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        if (!content) return; // Exit if no content element found

        const currentlyExpanded = header.getAttribute('aria-expanded') === 'true';

        // Set ARIA attribute immediately
        header.setAttribute('aria-expanded', !currentlyExpanded);

        if (!currentlyExpanded) {
            // Remove 'hidden' to allow CSS transition
            content.hidden = false;
            // Force reflow to ensure transition works correctly after display change
            // void content.offsetWidth; // This can sometimes help, but requestAnimationFrame is often better

            // Use requestAnimationFrame to apply styles in the next frame
             requestAnimationFrame(() => {
                content.style.maxHeight = content.scrollHeight + "px";
                // Add padding/opacity styles managed by CSS based on [aria-expanded="true"] + .accordion-content selector
             });

        } else {
            content.style.maxHeight = '0px';
            // Add hidden attribute *after* transition ends
            // CSS now handles the hiding via the [aria-expanded="false"] + .accordion-content selector
            // The transitionend listener might still be useful for complex cleanup if needed
            /*
            content.addEventListener('transitionend', () => {
                if (header.getAttribute('aria-expanded') === 'false') {
                   // content.hidden = true; // Re-hide if strictly necessary
                }
            }, { once: true });
            */
        }
    });
});


// --- Anime.js Animations ---
const GLOBAL_CFG = {
    loop: true
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if elements exist before animating
let swetCollection = document.querySelectorAll('.swet');
if (swetCollection.length > 0) {
    swetCollection.forEach((el, index) => {
        anime({
            ...GLOBAL_CFG,
            targets: el,
            opacity: [0, 1, 0],
            delay: index * 100,
            duration: index * 1500,
            translateY: index * 2,
            easing: 'easeInOutSine'
        });
    });
}

let spitCollection = document.querySelectorAll('.spit');
if (spitCollection.length > 0) {
    spitCollection.forEach((el, index) => {
        anime({
            ...GLOBAL_CFG,
            targets: el,
            opacity: [0, 1, 0],
            delay: 500,
            duration: index * 1000,
            translateY: getRndInteger(-30, 30),
            translateX: getRndInteger(-30, 30),
            easing: 'easeInOutSine'
        });
    });
}

let debreCollection = document.querySelectorAll('.debre');
if (debreCollection.length > 0) {
    debreCollection.forEach((el, index) => {
        anime({
            ...GLOBAL_CFG,
            targets: el,
            opacity: [0, 1, 0],
            delay: index * 100,
            duration: index * 100,
            scaleX: 1.3,
            scaleY: 1.3,
            translateY: getRndInteger(-10, -40),
            translateX: getRndInteger(-30, 30),
            easing: 'linear'
        });
    });
}

if (document.querySelector('#gear1 path')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#gear1 path',
        rotate: 360,
        easing: 'linear',
        duration: 5000
    });
}
if (document.querySelector('#gear2 path')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#gear2 path',
        rotate: -360,
        easing: 'linear',
        duration: 5000
    });
}
if (document.querySelector('#shortArrow')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#shortArrow',
        rotate: 360,
        duration: 10000,
        easing: 'linear',
        transformOrigin: ['4px 25px 0', '6px 27px 0']
    });
}
if (document.querySelector('#longArrow')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#longArrow',
        rotate: 360,
        duration: 800,
        easing: 'linear',
        transformOrigin: ['2px 32px 0', '10px 39px 0']
    });
}
if (document.querySelector('#leftHand')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#leftHand',
        rotate: 4,
        duration: 1200,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['2px 32px 0', '10px 39px 0']
    });
}
if (document.querySelector('#leftPalm')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#leftPalm',
        translateX: -8,
        duration: 1200,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['2px 32px 0', '10px 39px 0']
    });
}
if (document.querySelector('#rightHand')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#rightHand',
        rotate: 4,
        duration: 700,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['280px 120px 0', '280px 120px 0']
    });
}
if (document.querySelector('#rightPalm')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#rightPalm',
        rotate: 4,
        translateX: '-10px',
        translateY: '-3px',
        duration: 700,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['30px 30px 0', '30px 30px 0']
    });
}
if (document.querySelector('#pen')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#pen',
        rotate: 5,
        translateX: '-10px',
        translateY: '-3px',
        duration: 700,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['30px 30px 0', '30px 30px 0']
    });
}
if (document.querySelector('#mounth')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#mounth',
        scaleX: 1.05,
        scaleY: [1.1, .95],
        duration: 1800,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['30px 30px 0', '30px 30px 0']
    });
}
if (document.querySelector('#tongue')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#tongue',
        rotate: -3,
        scaleX: 1.1,
        scaleY: [1.05, .8],
        duration: 1800,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['30px 10px 0', '30px 10px 0']
    });
}
if (document.querySelector('#head')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#head',
        rotate: -2,
        duration: 2000,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['200px 200px 0', '200px 200px 0']
    });
}
if (document.querySelector('#hair1')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#hair1',
        rotate: -1.5,
        duration: 2000,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['200px 200px 0', '200px 200px 0']
    });
}
if (document.querySelector('#hair2')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#hair2',
        rotate: -2,
        duration: 2000,
        direction: 'alternate',
        easing: 'easeInOutSine',
        transformOrigin: ['100px 180px 0', '100px 180px 0']
    });
}
if (document.querySelector('#brows')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#brows',
        rotate: -5,
        translateY: -1,
        duration: 800,
        direction: 'alternate',
        easing: 'easeInOutSine',
    });
}
if (document.querySelector('#leftEye')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#leftEye',
        duration: 3000,
        scaleY: [.1, 1],
        delay: anime.stagger(100, {start: 500}),
        easing: 'easeInOutSine',
    });
}
if (document.querySelector('#rghtEye')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#rghtEye',
        duration: 3000,
        scaleY: [.1, 1],
        delay: anime.stagger(100, {start: 600}),
        easing: 'easeInOutSine',
    });
}
if (document.querySelector('#flash1')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#flash1',
        duration: getRndInteger(400, 500),
        scaleY: [.6],
        scaleX: [.6],
        rotate: getRndInteger(-4, 4),
        opacity: [0, .7, 0],
        easing: 'easeInOutSine',
    });
}
if (document.querySelector('#flash2')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#flash2',
        delay: 500,
        duration: getRndInteger(400, 500),
        scaleY: [.6],
        scaleX: [.6],
        rotate: getRndInteger(-4, 4),
        opacity: [0, .7, 0],
        easing: 'easeInOutSine',
    });
}
if (document.querySelector('#whiteFlash1')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#whiteFlash1',
        duration: 1000,
        opacity: [0, 0, .9, .7, .7, 0],
        easing: 'easeOutQuint',
    });
}
if (document.querySelector('#whiteFlash2')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#whiteFlash2',
        duration: 900,
        delay: 200,
        opacity: [0, .6, 0],
        easing: 'linear',
    });
}
if (document.querySelector('#paper1')) {
    anime({
        ...GLOBAL_CFG,
        targets: '#paper1',
        delay: 500,
        duration: 3500,
        scaleY: [0, .6],
        scaleX: [0, .6],
        translateX: [-200, -100],
        translateY: [-200, -100],
        rotate: getRndInteger(-400, -100),
        opacity: [0.3, .7, 0],
        easing: 'easeInOutSine',
    });
}


// --- Dynamic Year Update ---
const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}