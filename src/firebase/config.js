import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAM-SDQ_8dNoFjlE3UtXF5Ivo-fmA3YhWg",
  authDomain: "studied-jigsaw-463000-m8.firebaseapp.com",
  projectId: "studied-jigsaw-463000-m8",
  storageBucket: "studied-jigsaw-463000-m8.firebasestorage.app",
  messagingSenderId: "643357345801",
  appId: "1:643357345801:web:e637c319cc7c8cf17010d8",
  measurementId: "G-ZY118HXGSQ"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);


// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage, firebaseApp };