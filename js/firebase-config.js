import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJu3hm0JZHwMSU0d01jgnTcO16xtEVh6c",
  authDomain: "kkopiconnect-2f015.firebaseapp.com",
  projectId: "kkopiconnect-2f015",
  storageBucket: "kkopiconnect-2f015.firebasestorage.app",
  messagingSenderId: "365637024668",
  appId: "1:365637024668:web:72267a7bc226e77c0a6659",
  measurementId: "G-WFF18P93N2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };