const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// Use the legacy config method as planned
const SENDGRID_API_KEY = functions.config().sendgrid.key;
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Sends a confirmation email when a new donation is created.
 * This version reads donor info directly from the donation document.
 */
exports.sendDonationConfirmation = functions.firestore
  .document("donations/{donationId}")
  .onCreate(async (snap, context) => {
    // Get the data from the new donation document
    const donationData = snap.data();

    // Directly get user info from the donation data
    const userEmail = donationData.email;
    const userName = donationData.name;

    if (!userEmail || !userName) {
      console.log("Donation document is missing name or email. Cannot send email.");
      return null;
    }

    try {
      // Construct the email message
      const msg = {
        to: userEmail,
        from: "streetbites.pccoer@gmail.com", // IMPORTANT: Replace with your verified SendGrid email
        subject: "Thank you for your donation to StreetBites!",
        html: `
          <h1>Thank you, ${userName}!</h1>
          <p>We've received your generous donation and our team will be in touch soon to coordinate pickup from the address provided.</p>
          <p>Here are the details of your donation:</p>
          <ul>
            <li><strong>Food:</strong> ${donationData.foodName}</li>
            <li><strong>Quantity:</strong> ${donationData.quantity}</li>
            <li><strong>Date of Cooking:</strong> ${donationData.cookingDate}</li>
          </ul>
          <p>Your contribution is making a real difference. Thank you for helping us feed hope and build tomorrow.</p>
          <br>
          <p>Sincerely,</p>
          <p>The StreetBites Team</p>
        `,
      };

      // Send the email
      console.log(`Sending email to ${userEmail}...`);
      await sgMail.send(msg);
      console.log("Confirmation email sent successfully.");
      return null;

    } catch (error) {
      console.error("Error sending donation confirmation email:", error);
      return null;
    }
  });
