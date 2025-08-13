import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js"; // Import the centralized config

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const donationForm = document.getElementById('donation-form');
const successMessage = document.getElementById('success-message');
const donorTypeInput = document.getElementById('donor-type');
const submitButton = document.getElementById('submit-button');

// Set form style based on URL parameter
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type') || 'individual';
    donorTypeInput.value = userType;

    if (userType === 'organization') {
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    } else {
        submitButton.classList.add('bg-green-600', 'hover:bg-green-700');
    }
});

if (donationForm) {
    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const donationData = {
            name: document.getElementById('donor-name').value,
            email: document.getElementById('donor-email').value,
            address: document.getElementById('donor-address').value,
            foodName: document.getElementById('food-name').value,
            quantity: document.getElementById('quantity').value,
            cookingDate: document.getElementById('cooking-date').value,
            donorType: donorTypeInput.value,
            status: 'pending',
            submittedAt: serverTimestamp()
        };

        try {
            const docRef = await addDoc(collection(db, "donations"), donationData);
            console.log("Donation submitted with ID: ", docRef.id);
            
            donationForm.style.display = 'none';
            if(successMessage) successMessage.classList.remove('hidden');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 4000);

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("There was an error submitting your donation. Please try again.");
        }
    });
}
