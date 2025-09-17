import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a Base64 image to Firebase Storage and returns the public URL.
 * @param {string} base64String The Base64 data URL of the image.
 * @param {string} folderName The folder in Firebase Storage to upload to.
 * @returns {Promise<string|null>} The public URL of the uploaded image, or null if the input is invalid.
 */
export const uploadBase64Image = async (base64String, folderName = 'images') => {
  if (!base64String || !base64String.startsWith('data:image/')) {
    // If the input isn't a valid base64 string, return null to skip it.
    return null;
  }

  const storage = getStorage();
  const fileName = `${folderName}/${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const storageRef = ref(storage, fileName);

  try {
    const snapshot = await uploadString(storageRef, base64String, 'data_url');
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading image to ${folderName}:`, error);
    // Throw the error so the calling function can handle it.
    throw new Error('Image upload failed.');
  }
};