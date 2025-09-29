import { createUser, newUserDoc, signInUser, signOutUser, userForgotPassword, changePassword } from "../services/firebase/auth.sevices";
import { HttpStatus } from "../enums/status";
import { userDocRef } from "../services/firebase/users.services";
import { sendEmailVerification } from "firebase/auth";

export const signIn = async ( req ) => {
    const { email, password } = req;
    try{
        const userData = await signInUser(email, password);

        if (!userData.user.emailVerified) {
            throw new Error("Please verify your email before signing in.");
        }

        return {
            status: HttpStatus.OK,
            message: "User signed in successfully",
            data: userData
        };
    }catch(error){
        console.error(`Sign In Error: ${error.message}`);
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message
        };
    };
};

export const checkUserIfExist = ( uid ) => {
    const userCollection = userDocRef("users", uid);
    if(userCollection) return true;
    return false;   
}

export const signUp = async ( req ) => {
    const { email, password } = req;
    try{
        const userCredentials = await createUser(email, password);
        console.log(userCredentials.user);
        await newUserDoc(userCredentials, req);
        await sendEmailVerification(userCredentials.user, {
            url: 'http://localhost:3000/login'
        });
        return {
            status: HttpStatus.OK,
            message: "User created successfully" ,
        }
    }catch(error){
        console.error(`Creating User Error: ${error.message}`);
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message
        };
    };
};

export const signOut = async ( req ) => {
    try{
        const {uid} = req;
        if(!uid) throw new Error("User id not found")

        await signOutUser();
        return { 
            status: HttpStatus.OK, 
            message: "User signed out successfully" 
        };
    }catch(error){
        console.error(`Sign out Error: ${error.message}`);
        return { 
            status: HttpStatus.BAD_REQUEST, 
            message: error.message 
        };
    };
};

export const forgotPassword = async ( email ) => {
    try{
        // const { email } = req;

        if(!email) throw new Error("Email not specified")

        await userForgotPassword(email);
        return {
            status: HttpStatus.OK,
            message: "User signed out successfully"
        };
    }catch(error){
        console.error(`Forgot password Error: ${error.message}`);
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message
        };
    }
}

export const updatePassword = async ( req ) => {
    try{
        const { email, currentPassword, newPassword } = req;

        if(!email || !currentPassword || !newPassword) throw new Error("Email, current password, and new password are required")

        await changePassword(email, currentPassword, newPassword);
        return {
            status: HttpStatus.OK,
            message: "Password updated successfully"
        };
    }catch(error){
        console.error(`Password update Error: ${error.message}`);
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message
        };
    }
}

