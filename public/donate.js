import { app } from './firebase-config.js';
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

const functions = getFunctions(app);

// Get references to the form and its elements
const donationForm = document.getElementById('donation-form');
const submitButton = document.getElementById('submit-button');
const formFeedback = document.getElementById('form-feedback');
const formTitle = document.getElementById('form-title');

// Determine donation type from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const donationType = urlParams.get('type') || 'individual'; // Default to individual

// Set the title based on the donation type
if (formTitle) {
    const typeText = donationType.charAt(0).toUpperCase() + donationType.slice(1);
    formTitle.textContent = `${typeText} Donation`;
}


// Listen for the form submission
donationForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Show a loading state on the button
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <div class="spinner-border animate-spin inline-block w-5 h-5 border-4 rounded-full" role="status"></div>
        <span class="ml-2">Submitting...</span>
    `;

    // Get the reCAPTCHA site key from the script tag
    const recaptchaScript = document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]');
    const RECAPTCHA_SITE_KEY = recaptchaScript.src.split('render=')[1];

    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === "YOUR_SITE_KEY_HERE") {
        showFeedback("reCAPTCHA Site Key is not configured. Please add it to donate.html.", "error");
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Donation';
        return;
    }

    try {
        // Execute reCAPTCHA to get a token
        grecaptcha.ready(async () => {
            const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });

            // Collect the form data into an object
            const formData = new FormData(donationForm);
            const donationData = {};
            formData.forEach((value, key) => {
                donationData[key] = value;
            });
            donationData.type = donationType; // Add the donation type

            // Call the secure Cloud Function
            const submitDonation = httpsCallable(functions, 'submitDonation');
            const result = await submitDonation({ donationData, recaptchaToken: token });

            // Handle success
            console.log(result.data.message);
            showFeedback('Thank you! Your donation has been submitted successfully. Redirecting home...', 'success');
            donationForm.reset();

            // *** NEW: Redirect after a delay ***
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 4000); // Wait 4 seconds before redirecting

        });
    } catch (error) {
        // Handle errors
        console.error('Error submitting donation:', error);
        showFeedback(error.message || 'An unknown error occurred. Please try again.', 'error');
        
        // Restore the button's original state after error
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Donation';
    }
});


// Helper function to display feedback messages to the user
function showFeedback(message, type) {
    formFeedback.textContent = message;
    formFeedback.className = `p-4 rounded-md text-center font-medium ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
    formFeedback.classList.remove('hidden');
}

