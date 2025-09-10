// Import necessary modules
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const axios = require("axios"); // Used to make the reCAPTCHA verification request

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Set global options for all functions in this file
setGlobalOptions({ region: "asia-south1", secrets: ["SENDGRID_KEY", "RECAPTCHA_SECRET_KEY"] });

/**
 * An HTTPS Callable function to handle new donation submissions.
 * It verifies the reCAPTCHA token before saving data to Firestore.
 */
exports.submitDonation = onCall(async (request) => {
  const { donationData, recaptchaToken } = request.data;
  const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

  // 1. Verify the reCAPTCHA token
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`
    );

    const { success, score } = response.data;
    console.log(`reCAPTCHA verification score: ${score}`);

    // Check if reCAPTCHA verification was successful and score is above threshold
    if (!success || score < 0.5) {
      console.log("reCAPTCHA verification failed. Score:", score);
      throw new HttpsError("invalid-argument", "reCAPTCHA verification failed. Are you a robot?");
    }

  } catch (error) {
    console.error("Error during reCAPTCHA verification:", error);
    throw new HttpsError("internal", "An error occurred during reCAPTCHA verification.");
  }

  // 2. If reCAPTCHA is valid, save the donation to Firestore
  try {
    // Add a server-side timestamp and initial status
    const dataToSave = {
      ...donationData,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("donations").add(dataToSave);
    console.log("Donation saved successfully.");
    return { success: true, message: "Donation submitted successfully!" };

  } catch (error) {
    console.error("Error saving donation to Firestore:", error);
    throw new HttpsError("internal", "Failed to save donation.");
  }
});


/**
 * Sends a confirmation email using a SendGrid template when a new donation is created.
 * This function triggers automatically when the submitDonation function succeeds.
 */
exports.sendDonationConfirmation = onDocumentCreated("donations/{donationId}", async (event) => {
  const SENDGRID_API_KEY = process.env.SENDGRID_KEY;
  sgMail.setApiKey(SENDGRID_API_KEY);

  const snap = event.data;
  if (!snap) {
    console.log("No data associated with the event");
    return;
  }
  const donationData = snap.data();

  const userEmail = donationData.email;
  const userName = donationData.name;

  if (!userEmail || !userName) {
    console.log("Donation document is missing name or email. Cannot send email.");
    return;
  }

  const msg = {
    to: userEmail,
    from: "your-verified-email@example.com", // This must be a verified sender in SendGrid
    templateId: "d-YOUR_TEMPLATE_ID_HERE", 
    dynamicTemplateData: {
      userName: userName,
      foodName: donationData.foodName,
      quantity: donationData.quantity,
      cookingDate: donationData.cookingDate,
    },
  };

  try {
    console.log(`Sending template email to ${userEmail}...`);
    await sgMail.send(msg);
    console.log("Confirmation email sent successfully.");
  } catch (error) {
    console.error("Error sending donation confirmation email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
});
