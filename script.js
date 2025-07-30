// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Modal Navigation ---
    const loginOverlay = document.getElementById('login-overlay');
    const donationOverlay = document.getElementById('donation-overlay');
    const confirmationModal = document.getElementById('confirmation-modal');

    const loginPage = document.getElementById('login-page');
    const donationPage = document.getElementById('donation-page');

    // Function to hide all overlays
    window.hideAllOverlays = function() {
        if(loginOverlay) loginOverlay.style.display = 'none';
        if(donationOverlay) donationOverlay.style.display = 'none';
        if(confirmationModal) confirmationModal.style.display = 'none';
    }

    // Function to close overlays when clicking on the background
    function closeOverlays(e) {
         if (e.target === loginOverlay || e.target === donationOverlay || e.target === confirmationModal) {
            hideAllOverlays();
        }
    }
    
    window.addEventListener('click', closeOverlays);


    // --- Login/Signup Page Logic ---
    // Make this function globally accessible
    window.showLoginPage = function(type) {
        if (!loginPage || !loginOverlay) return;

        const isIndividual = type === 'individual';
        const title = isIndividual ? 'Individual' : 'Organization';
        const accentColor = isIndividual ? 'green' : 'blue';

        loginPage.innerHTML = `
            <div class="p-8 space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-3xl font-bold text-gray-900">${title} Portal</h2>
                    <button onclick="hideAllOverlays()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="flex border-b border-gray-200">
                    <button id="login-tab" class="flex-1 py-2 text-center font-medium border-b-2 border-${accentColor}-600 text-${accentColor}-600">Login</button>
                    <button id="signup-tab" class="flex-1 py-2 text-center font-medium text-gray-500">Sign Up</button>
                </div>

                <form id="login-form" class="space-y-6">
                    <input type="email" placeholder="Email Address" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    <input type="password" placeholder="Password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    <button type="submit" class="w-full bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Login</button>
                </form>

                <form id="signup-form" class="hidden space-y-4">
                    <input type="text" placeholder="Full Name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    ${!isIndividual ? `<input type="text" placeholder="Organization Name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">` : ''}
                    <input type="email" placeholder="Email Address" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    <input type="password" placeholder="Create Password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    <button type="submit" class="w-full bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Create Account</button>
                </form>
            </div>
        `;
        loginOverlay.style.display = 'flex';

        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        loginTab.addEventListener('click', () => {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            loginTab.classList.add(`border-${accentColor}-600`, `text-${accentColor}-600`);
            loginTab.classList.remove('text-gray-500');
            signupTab.classList.remove(`border-${accentColor}-600`, `text-${accentColor}-600`);
            signupTab.classList.add('text-gray-500');
        });

        signupTab.addEventListener('click', () => {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            signupTab.classList.add(`border-${accentColor}-600`, `text-${accentColor}-600`);
            signupTab.classList.remove('text-gray-500');
            loginTab.classList.remove(`border-${accentColor}-600`, `text-${accentColor}-600`);
            loginTab.classList.add('text-gray-500');
        });
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideAllOverlays();
            showDonationPage(type); 
        });
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideAllOverlays();
            showDonationPage(type);
        });
    }

    // --- Donation Page Logic ---
    function showDonationPage(type) {
        if (!donationPage || !donationOverlay) return;

        const isIndividual = type === 'individual';
        const accentColor = isIndividual ? 'green' : 'blue';
        
        donationPage.innerHTML = `
            <div class="p-8 space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-3xl font-bold text-gray-900">New Donation</h2>
                    <button onclick="hideAllOverlays()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form id="donation-form" class="space-y-6">
                    <div>
                        <label for="food-name" class="block text-sm font-medium text-gray-700">Name of Food</label>
                        <input type="text" id="food-name" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    </div>
                    <div>
                        <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity (e.g., 5 meals, 10 kg)</label>
                        <input type="text" id="quantity" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    </div>
                    <div>
                        <label for="cooking-date" class="block text-sm font-medium text-gray-700">Date of Cooking</label>
                        <input type="date" id="cooking-date" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500">
                    </div>
                    <button type="submit" class="w-full bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Submit Donation</button>
                </form>
            </div>
        `;
        donationOverlay.style.display = 'flex';

        const donationForm = document.getElementById('donation-form');
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideAllOverlays();
            showConfirmation();
        });
    }
    
    // --- Confirmation Modal Logic ---
    const okBtn = document.getElementById('ok-btn');

    function showConfirmation() {
        if (confirmationModal) confirmationModal.style.display = 'flex';
    }

    if (okBtn) {
        okBtn.onclick = function() {
            hideAllOverlays();
        }
    }

    // --- FAB Logic ---
    const fabContainer = document.getElementById('fab-container');
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fab-options');
    const fabIconPlus = document.getElementById('fab-icon-plus');
    const fabIconClose = document.getElementById('fab-icon-close');

    if (fab) {
        fab.addEventListener('click', () => {
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
            fabOptions.classList.add('hidden');
            fabContainer.classList.remove('open');
            fabIconPlus.classList.remove('hidden');
            fabIconClose.classList.add('hidden');
            fab.classList.remove('rotate-45');
        }
    });
});
