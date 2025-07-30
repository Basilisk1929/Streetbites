document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- FAB Logic ---
    const fabContainer = document.getElementById('fab-container');
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fab-options');
    const fabIconPlus = document.getElementById('fab-icon-plus');
    const fabIconClose = document.getElementById('fab-icon-close');

    if (fab) {
        fab.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from bubbling up to the document
            fabOptions.classList.toggle('hidden');
            fabContainer.classList.toggle('open');
            fabIconPlus.classList.toggle('hidden');
            fabIconClose.classList.toggle('hidden');
            fab.classList.toggle('rotate-45');
        });
    }

    // Hide FAB options if clicking outside
    document.addEventListener('click', (event) => {
        if (fabContainer && !fabContainer.contains(event.target)) {
            if (fabContainer.classList.contains('open')) {
                fabOptions.classList.add('hidden');
                fabContainer.classList.remove('open');
                fabIconPlus.classList.remove('hidden');
                fabIconClose.classList.add('hidden');
                fab.classList.remove('rotate-45');
            }
        }
    });
});
