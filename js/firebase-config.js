// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyDcmkkzGqHZv5OWUUhtapd5C4NPNXbLCU0",
  authDomain: "medplatform-e1bca.firebaseapp.com",
  projectId: "medplatform-e1bca",
  storageBucket: "medplatform-e1bca.firebasestorage.app",
  messagingSenderId: "647925991266",
  appId: "1:647925991266:web:258d8a25fec0a0e46f0e3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
