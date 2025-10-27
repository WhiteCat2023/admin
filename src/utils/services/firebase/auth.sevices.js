// working on this
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, signInWithCredential, updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateEmail} from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { setDoc,doc } from "firebase/firestore";

export async function signInUser(email, password){
   return await signInWithEmailAndPassword(auth, email, password);
}

export async function createUser(email, password){
   return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(){
   return await signOut(auth)
} 

export async function userForgotPassword(email) {
   return await sendPasswordResetEmail(auth, email)
}

export const signInWithToken = async (credential) => {
    return await signInWithCredential(auth, credential)     
}

export async function newUserDoc(userCredentials, req) {
  try {
    const {
      uid,
      displayName,
      email,
      phoneNumber,
      metadata,
      providerData,
    } = userCredentials.user;

    const {firstName, lastName} = req

    const providerId = providerData?.[0]?.providerId || null;
    const photoUrl = providerData?.[0]?.photoURL || null;

    await setDoc(doc(db, "admin", uid), {
      name: displayName || `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone: phoneNumber || null,
      photoUrl,
      providerId,
      createdAt: metadata?.creationTime || null,
      lastSignedIn: metadata?.lastSignInTime || null,
    });
  } catch (error) {
    console.error(`Firestore Error: ${error.message}`);
    throw error;
  }
}

/**
 * Changes the user's password with verification.
 * Requires reauthentication with current password for security.
 *
 * @param {string} email - User's email
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
export async function changePassword(email, currentPassword, newPassword) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user is currently signed in");
    }

    // Create credential for reauthentication
    const credential = EmailAuthProvider.credential(email, currentPassword);

    // Reauthenticate the user
    await reauthenticateWithCredential(user, credential);

    // Update the password
    await updatePassword(user, newPassword);

    console.log("Password updated successfully");
  } catch (error) {
    console.error(`Password change error: ${error.message}`);
    throw error;
  }
}

export const reauthenticateUser = async (email, currentPassword) => {
  const credential = EmailAuthProvider.credential(email, currentPassword);
  return credential
}

/**
 * Changes the user's email with verification.
 * Requires reauthentication with current password for security.
 *
 * @param {string} currentEmail - User's current email
 * @param {string} currentPassword - Current password for verification
 * @param {string} newEmail - New email to set
 * @returns {Promise<void>}
 */
export async function changeEmail(currentEmail, currentPassword, newEmail) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user is currently signed in");
    }

    // Create credential for reauthentication
    const credential = EmailAuthProvider.credential(currentEmail, currentPassword);

    // Reauthenticate the user
    await reauthenticateWithCredential(user, credential);

    // Update the email
    await updateEmail(user, newEmail);

    console.log("Email updated successfully");
  } catch (error) {
    console.error(`Email change error: ${error.code} - ${error.message}`);
    throw error;
  }
}

/**
 * Deletes the user account with verification.
 * Requires reauthentication with current password for security.
 *
 * @param {string} password - Current password for verification
 * @returns {Promise<void>}
 */
export async function deleteUserAccount(password) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user is currently signed in");
    }

    const email = user.email;

    // Create credential for reauthentication
    const credential = EmailAuthProvider.credential(email, password);

    // Reauthenticate the user
    await reauthenticateWithCredential(user, credential);

    // Delete the user account
    await user.delete();

    console.log("User account deleted successfully");
  } catch (error) {
    console.error(`Account deletion error: ${error.code} - ${error.message}`);
    throw error;
  }
}



