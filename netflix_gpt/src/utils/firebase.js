// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDin2thUMEYLCEcT5QUQUrWDTHa1Jti5Bk",
  authDomain: "netflixgpt-7d954.firebaseapp.com",
  projectId: "netflixgpt-7d954",
  storageBucket: "netflixgpt-7d954.firebasestorage.app",
  messagingSenderId: "976059576388",
  appId: "1:976059576388:web:6982e18f4d77051d89cc11",
  measurementId: "G-N09G4951FN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();