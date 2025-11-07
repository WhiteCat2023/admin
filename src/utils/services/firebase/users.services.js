import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db, auth, storage, secondaryAuth } from "../../config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";

/**
 * This function can be use to make reference of documents in the firestore. It accepts a collection param and 
 * a docId param. The "collection" param accepts a string that points to a specific collection inside Firestore and the "docId" param 
 * accepts the string with the document ID
 * 
 * By: Berndt Dennis F. Canaya
 * 
 * @param {string} collection 
 * @param {string} docId 
 * @returns 
 */
export function userDocRef(collectionName, docId) {
  const docRef = doc(db, collectionName, docId)
  return docRef
}

/**
 * This function updates a specific field in the user documents
 * 
 * By: Berndt Dennis F. Canaya
 * 
 * @param {string} collection 
 * @param {string} uid 
 * @param {string} field 
 * @param {string} value 
 */
export async function updateUserDoc(collectionName, uid, field, value) {
  const userCollection = userDocRef(collectionName, uid)
  if(!collectionName || !uid || !field || value === undefined) throw new Error("Missing required values: collection, uid, field, value")
  const docSnapshot = await getDoc(userCollection)
  if(!docSnapshot.exists()) throw new Error("User doesn't exist")
  await updateDoc(userCollection,{
    [field]: value,
    updatedAt: serverTimestamp()
  })
}

/**
 * This function updates the User's Name inside the Firestore. It the name inside the firestore is present it will be used
 * and if it doesnt exist the app will make use of the display name returned from their email provider.
 * 
 * By: Berndt Dennis F. Canaya 
 *  
 * @param {object} credentials 
 * @returns 
 */
export async function updateUserName(credentials){
  try {
    let uid, field, value;
    if (credentials instanceof FormData) {
      uid = credentials.get('uid');
      field = credentials.get('field');
      value = credentials.get('value');
    } else {
      ({ uid, field, value } = credentials);
    }
    if(!uid) throw new Error("User not found");

    await updateUserDoc("admin", uid, field, value)

    return uid
  } catch (error) {
    console.error(`Firestore Error: ${error.message}`);
    throw error;
  };
};

/**
 * This function updates the phone number of the user.
 * 
 * By: Berndt Dennis F. Canaya
 * 
 * @param {object} credentials 
 * @returns 
 */
export async function updateUserPhoneNumber(credentials) {
  try {
    const {uid, phoneNumber} = credentials;

    if(!uid) throw new Error("User not found");

    await updateDoc(doc(db, "admin", uid), {
      phone: phoneNumber,
      updatedAt: serverTimestamp()
    })
    return uid
  } catch (error) {
    console.error(`Firestore Error: ${error.message}`);
    throw error;
  };
};

/**
 * This function is currently under construction. It returns all the users from the Firestore
 * 
 * By: Berndt Dennis F. Canaya
 * 
 * @param {*} callback 
 * @returns 
 */
export function getAllUsers(callback) {
  try {
    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      callback(users); 
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up real-time users listener:', error);
    throw error;
  }
}

/**
 * This function returns all admin users from the Firestore (real-time listener).
 * If a callback is provided it will be called with the latest list; otherwise it returns an unsubscribe function.
 * 
 * By: Berndt Dennis F. Canaya
 * 
 * @param {*} callback 
 * @returns unsubscribe function or throws
 */
export function getAllAdminUsers(callback) {
  try {
    const usersRef = collection(db, 'admin');

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      if (typeof callback === "function") callback(users);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up real-time admin users listener:', error);
    throw error;
  }
}

/**
 * This function is currently under construction. It returns a specific user from the Firestore.
 * 
 * By: Berndt Dennis F. Canaya
 * 
 * @param {string} uid 
 * @param {function} callback 
 * @returns 
 */
export async function getUserDoc(uid) {
  try {
    const userDoc = userDocRef("admin", uid);

    if(!uid) throw new Error("User not found")

    const snapshot = await getDoc(userDoc);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Real-time getUserById error:", error);
    throw error;
  }
}

/**
 * This function updates the user's profile picture by uploading to Firebase Storage and updating Firestore.
 *
 * @param {object} credentials - Contains uid and file
 * @returns
 */
export async function updateProfilePic(credentials) {
  try {
    let uid, file;
    if (credentials instanceof FormData) {
      uid = credentials.get('uid');
      file = credentials.get('file');
    } else {
      ({ uid, file } = credentials);
    }

    if (!uid) throw new Error("User not found");
    if (!file) throw new Error("Profile picture file not provided");

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG images are allowed.");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    // Upload to Firebase Storage
    const filename = `profile.jpg`;
    const storageRef = ref(storage, `profile_pics/${uid}/${filename}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Update Firestore
    await updateUserDoc("admin", uid, "profilePic", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error(`Profile picture update Error: ${error.message}`);
    throw error;
  }
}

/**
 * This function updates the user's cover photo by uploading to Firebase Storage and updating Firestore.
 *
 * @param {object} credentials - Contains uid and file
 * @returns
 */
export async function updateCoverPhoto(credentials) {
  try {
    let uid, file;
    if (credentials instanceof FormData) {
      uid = credentials.get('uid');
      file = credentials.get('file');
    } else {
      ({ uid, file } = credentials);
    }

    if (!uid) throw new Error("User not found");
    if (!file) throw new Error("Cover photo file not provided");

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG images are allowed.");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    // Upload to Firebase Storage
    const filename = `cover.jpg`;
    const storageRef = ref(storage, `cover_photos/${uid}/${filename}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Update Firestore
    await updateUserDoc("admin", uid, "coverPhoto", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error(`Cover photo update Error: ${error.message}`);
    throw error;
  }
}

/**
 * createAdminUser
 * - creates an Authentication user with email/password
 * - creates a Firestore document in "admin" with profile data
 * - returns the created profile object
 *
 * NOTE: createUserWithEmailAndPassword requires the caller to have privilege
 * (i.e. the current authenticated client must be allowed to create users).
 * In many setups this is performed by a backend (admin SDK) instead.
 */
export async function createAdminUser({ name, firstName, lastName, email, role = "admin", password }) {
  if (!email || !password) {
    throw new Error("Email and password are required to create an admin user.");
  }

  // create auth user
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = userCredential.user.uid;

  // prepare profile
  const profile = {
    uid,
    name: name || "",
    firstName: firstName || "",
    lastName: lastName || "",
    email,
    role,
    online: false,
    restricted: false,
    createdAt: serverTimestamp(),
  };

  // persist in Firestore under "admin/<uid>"
  const adminDocRef = doc(db, "admin", uid);
  await setDoc(adminDocRef, profile);
  await sendEmailVerification(userCredential.user);
  await signOut(secondaryAuth);

  // return profile with uid (createdAt will be a server timestamp sentinel)
  return { ...profile, uid };
}

export const updateAdminRestrictionStatus = async (uid, restricted) => {
  try {
    if (!uid) throw new Error("UID is required");
    const userRef = doc(db, "admin", uid);
    await updateDoc(userRef, { 
      restricted,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating admin restriction status: ${error.message}`);
    throw error;
  }
};

export const updateAdminActivity = async (uid, online) => {
  try {
    if (!uid) throw new Error("UID is required");
    const userRef = doc(db, "admin", uid);
    await updateDoc(userRef, { 
      online,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating admin activity: ${error.message}`);
    throw error;
  }
};






