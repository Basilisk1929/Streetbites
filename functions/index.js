// Import necessary modules
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");

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

  if (!recaptchaToken) {
    throw new HttpsError("invalid-argument", "No reCAPTCHA token provided.");
  }
  if (!RECAPTCHA_SECRET) {
      console.error("RECAPTCHA_SECRET_KEY is not set in function secrets.");
      throw new HttpsError("internal", "Server configuration error.");
  }

  // 1. Verify the reCAPTCHA token
  try {
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`;
    const response = await axios.post(verificationUrl);
    const { success, score, 'error-codes': errorCodes } = response.data;

    console.log(`reCAPTCHA response: success=${success}, score=${score}`);

    if (errorCodes && errorCodes.length > 0) {
        console.error("reCAPTCHA verification returned error codes:", errorCodes);
        // This is a common error if the secret key is invalid
        if (errorCodes.includes('invalid-input-secret')) {
             throw new HttpsError("invalid-argument", "The reCAPTCHA secret key is invalid.");
        }
        throw new HttpsError("invalid-argument", `reCAPTCHA error: ${errorCodes.join(", ")}`);
    }

    if (!success || score < 0.5) {
      console.warn(`reCAPTCHA verification failed. Success: ${success}, Score: ${score}`);
      throw new HttpsError("permission-denied", "reCAPTCHA verification failed. Please try again.");
    }

  } catch (error) {
    // This catches errors from the axios call itself or re-throws our HttpsError
    console.error("Error during reCAPTCHA verification:", error.message);
    if (error instanceof HttpsError) {
        throw error; // Re-throw HttpsError so the client gets the specific message
    }
    throw new HttpsError("internal", "An unexpected error occurred during reCAPTCHA verification.");
  }

  // 2. If reCAPTCHA is valid, save the donation to Firestore
  try {
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
    throw new HttpsError("internal", "Failed to save donation data.");
  }
});


/**
 * Sends a confirmation email using a SendGrid template when a new donation is created.
 */
exports.sendDonationConfirmation = onDocumentCreated("donations/{donationId}", async (event) => {
  const SENDGRID_API_KEY = process.env.SENDGRID_KEY;
  if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_KEY is not set in function secrets. Cannot send email.");
      return;
  }
  sgMail.setApiKey(SENDGRID_API_KEY);

  const snap = event.data;
  if (!snap) {
    console.log("No data associated with the event");
    return;
  }
  const donationData = snap.data();

  const { email: userEmail, name: userName, foodName, quantity, cookingDate } = donationData;

  if (!userEmail || !userName) {
    console.log("Donation document is missing name or email. Cannot send email.");
    return;
  }

  const msg = {
    to: userEmail,
    from: {
        email: "streetbites.pccoer@gmail.com", // This must be a verified sender in SendGrid
        name: "StreetBites"
    },
    templateId: "d-d0ad0e5ac3b748ecace53eada37a324d",
    dynamicTemplateData: {
      userName,
      foodName,
      quantity,
      cookingDate,
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

