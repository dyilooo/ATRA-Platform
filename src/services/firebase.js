// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAulYr7zu8f3wtEBkDo9I2k5aA9_Lsb1yw",
  authDomain: "maintenancesystem-ebc00.firebaseapp.com",
  projectId: "maintenancesystem-ebc00",
  storageBucket: "maintenancesystem-ebc00.firebasestorage.app",
  messagingSenderId: "163788635526",
  appId: "1:163788635526:web:172dd76cd952255ca44007",
  measurementId: "G-PE5MZYX8WL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firedb = getFirestore(app)

export const auth = getAuth(app)

export const firestore = getFirestore(app)