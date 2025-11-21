import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc, } from "firebase/firestore";
import { db } from "../../../utils/config/firebase";

export const newTermsAndConditions = async (termsData) => {

    if (termsData === null || typeof termsData !== 'object') throw new Error("Invalid terms data provided.");
    
    try {
        await addDoc(collection(db, "termsAndConditions"), termsData);
    } catch (error) {
        console.error("Error adding new Terms and Conditions: ", error);
        return false;
    }
}

export const getTermsAndConditions = async (callback) => {
    if (typeof callback !== 'function') throw new Error("A valid callback function must be provided.");
    try {
        const collectionRef = collection(db, 'termsAndConditions');
    
        const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
            const terms = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(terms);
        });
    
        return unsubscribe;
    } catch (error) {
        console.error('Error setting up real-time admin users listener:', error);
        throw error;
    }
}

export const updateTermsAndConditions = async (termsId, updatedData) => {
    if (!termsId || typeof updatedData !== 'object') throw new Error("Invalid parameters provided.");
    try {
        const termsRef = doc(db, 'termsAndConditions', termsId);
        await updateDoc(termsRef, {
            ...updatedData,
            "tc_patch_date": serverTimestamp(),
            "tc_updatedBy": updatedData.tc_author,
        });
    } catch (error) {
        console.error("Error updating Terms and Conditions: ", error);
        return false;
    }
}

export const deleteTermsAndConditions = async (termsId) => {
    if (!termsId) throw new Error("Invalid terms ID provided.");
    try {
        const termsRef = doc(db, 'termsAndConditions', termsId);
        await deleteDoc(termsRef);
    } catch (error) {
        console.error("Error deleting Terms and Conditions: ", error);
        return false;
    }   
}