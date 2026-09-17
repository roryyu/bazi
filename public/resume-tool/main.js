(function() {
  // Typewriter effect
  var roles = ["技术经理", "AI应用架构师", "AI Agent技术专家", "技术总监"];
  var roleIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typewriterElement = document.getElementById('typewriter');
  
  function typeWriter() {
    var currentRole = roles[roleIndex];
    if (isDeleting) {
      typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }
    
    var typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500;
    }
    
    setTimeout(typeWriter, typeSpeed);
  }
  
  // Navbar scroll effect
  var navbar = document.getElementById('navbar');
  function handleScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  }
  
  // Mobile menu toggle
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuIcon = document.getElementById('menuIcon');
  var closeIcon = document.getElementById('closeIcon');
  var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  function toggleMobileMenu() {
    mobileMenu.classList.toggle('open');
    menuIcon.style.display = menuIcon.style.display === 'none' ? 'block' : 'none';
    closeIcon.style.display = closeIcon.style.display === 'none' ? 'block' : 'none';
  }
  
  function closeMobileMenuFunc() {
    mobileMenu.classList.remove('open');
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  }
  
  // Job detail toggle
  var jobCards = document.querySelectorAll('.job-card');
  
  function toggleJobCard(card) {
    var detail = card.querySelector('.job-detail');
    var chevron = card.querySelector('.job-chevron');
    if (detail) {
      detail.classList.toggle('open');
    }
    if (chevron) {
      chevron.classList.toggle('rotated');
    }
  }
  
  // Scroll animations
  function handleScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .scale-in');
    var windowHeight = window.innerHeight;
    
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 100) {
        el.classList.add('visible');
      }
    }
  }
  
  // Smooth scroll
  function handleAnchorClick(e) {
    e.preventDefault();
    var targetId = this.getAttribute('href').substring(1);
    var target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileMenuFunc();
    }
  }
  
  // Initialize
  function init() {
    // Start typewriter
    typeWriter();
    
    // Scroll events
    window.addEventListener('scroll', function() {
      handleScroll();
      handleScrollAnimations();
    });
    
    // Mobile menu
    if (menuBtn) {
      menuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Mobile nav links
    for (var i = 0; i < mobileNavLinks.length; i++) {
      mobileNavLinks[i].addEventListener('click', handleAnchorClick);
    }
    
    // Desktop nav links
    var navLinks = document.querySelectorAll('.nav-link');
    for (var j = 0; j < navLinks.length; j++) {
      navLinks[j].addEventListener('click', handleAnchorClick);
    }
    
    // Job cards
    for (var k = 0; k < jobCards.length; k++) {
      (function(index) {
        jobCards[index].addEventListener('click', function() {
          toggleJobCard(this);
        });
        // Open first job card
        if (index === 0) {
          toggleJobCard(jobCards[index]);
        }
      })(k);
    }
    
    // Initial animation check
    handleScrollAnimations();
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
