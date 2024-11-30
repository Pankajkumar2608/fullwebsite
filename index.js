
let prevScrollpos = window.pageYOffset;
const navBar = document.getElementById("mainNav");

const headline = document.getElementById('typing-headline');
const textToType = "Predict Your Ideal College";
let index = 0;
let isDeleting = false;



function type() {1
  const currentText = headline.textContent;

  if (!isDeleting && index < textToType.length) {
    headline.textContent = textToType.substring(0, index + 1);
    index++;
  } else if (isDeleting && index > 0) {
    headline.textContent = textToType.substring(0, index - 1);
    index--;
  }

  let typingSpeed = 80;
  if (index === textToType.length || index === 0) {
    typingSpeed = 1000;
    isDeleting = !isDeleting;
    
  }

  setTimeout(type, typingSpeed);
}

window.addEventListener('load', type);

window.onscroll = function() {
  let currentScrollPos = window.pageYOffset;

  if (prevScrollpos > currentScrollPos) {
    navBar.classList.remove("hide");
  } else {
    navBar.classList.add("hide");
  }
  prevScrollpos = currentScrollPos;
}

function toggleMenu() {
  const nav = document.getElementById("mainNav");
  nav.classList.toggle("show");
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - navBar.offsetHeight,
        behavior: 'smooth'
      });
    }
  });
});

const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    header.classList.toggle("active");
    const content = header.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});