// nav-active.js
// Highlights navigation links (both desktop and mobile) matching the current page URL.

document.addEventListener('DOMContentLoaded', () => {
  // Select all navigation links in desktop header and mobile drawer
  const navLinks = document.querySelectorAll('.dashboard-nav a, .mobile-drawer-nav a');
  const currentPage = window.location.pathname.split('/').pop();

  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
