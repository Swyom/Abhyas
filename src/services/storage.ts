import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from './firebaseConfig';
import * as FileSystem from 'expo-file-system/legacy';

export const uploadProfileImage = async (userId: string, imageUri: string) => {
  try {
    console.log(`Starting upload for user: ${userId}, uri: ${imageUri}`);
    
    // First, let's verify the file exists and get its size
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist at the provided URI.");
    }
    
    // Validate file size (e.g., max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (fileInfo.size && fileInfo.size > MAX_SIZE) {
      throw new Error("File is too large. Please select an image under 5MB.");
    }

    console.log("Converting image to blob via XMLHttpRequest...");
    // Using XMLHttpRequest is the most reliable way to get a Blob from a local URI in React Native
    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", imageUri, true);
      xhr.send(null);
    });
    
    const storageRef = ref(storage, `profile_images/${userId}.jpg`);
    
    console.log("Uploading blob to Firebase Storage...");
    await uploadBytes(storageRef, blob);
    
    console.log("Upload successful, fetching download URL...");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL retrieved:", downloadURL);
    
    return { success: true, url: downloadURL };
  } catch (error: any) {
    // Log the FULL error payload for debugging
    console.error("🔥 FIREBASE STORAGE ERROR FULL PAYLOAD:", error);
    if (error.serverResponse) {
      console.error("🔥 Server Response:", error.serverResponse);
    }
    
    return { 
      success: false, 
      error: error.message || "An unknown error occurred during upload."
    };
  }
};
