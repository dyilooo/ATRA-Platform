/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Schedule function to run at midnight PH time (16:00 UTC previous day)
exports.resetDailyUsage = functions.pubsub
  .schedule("0 16 * * *")
  .timeZone("Asia/Manila")
  .onRun(async (context) => {
    const db = admin.firestore();
    const apiKeysRef = db.collection("apiKeys");
    const snapshot = await apiKeysRef.get();
    
    const batch = db.batch();
    const today = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).split(",")[0];

    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        dailyUsage: 0,
        lastResetDate: today
      });
    });

    await batch.commit();
    console.log("Daily usage reset completed");
    return null;
  });
