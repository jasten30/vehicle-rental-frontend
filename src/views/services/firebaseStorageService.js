import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';

// --- IMPORTANT: TEMPORARY DEBUGGING STEP ---
// Replace the values below with the EXACT configuration from your Firebase project.
// This bypasses the environment variable loading issue.
const firebaseConfig = {
  apiKey: "AIzaSyAM-SDQ_8dNoFjlE3UtXF5Ivo-fmA3YhWg",
  authDomain: "studied-jigsaw-463000-m8.firebaseapp.com",
  projectId: "studied-jigsaw-463000-m8",
  storageBucket: "studied-jigsaw-463000-m8.firebasestorage.app",
  messagingSenderId: "643357345801",
  appId: "1:643357345801:web:2d687778158232477010d8",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

// Authenticate with the provided token
const authenticateUser = async () => {
  try {
    // We still use __initial_auth_token from the environment, as it's provided by Canvas
    if (typeof __initial_auth_token !== 'undefined') {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }
    console.log("Firebase authenticated successfully.");
  } catch (error) {
    console.error("Firebase authentication failed:", error);
  }
};

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * @param {File} file The file object to upload.
 * @param {string} filePath The path in Firebase Storage to save the file.
 * @returns {Promise<string>} The public download URL of the uploaded file.
 */
export const uploadImageToFirebase = async (file, filePath) => {
  try {
    await authenticateUser();
    
    if (!file || !filePath) {
      throw new Error("File or file path not provided for upload.");
    }

    const storageRef = ref(storage, filePath);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const url = await getDownloadURL(storageRef);
    
    console.log(`File uploaded successfully: ${url}`);
    return url;

  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw error;
  }
};
