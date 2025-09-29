import { HttpStatus } from "../enums/status";
import { getAllUsers, getUserDoc, updateUserName, updateUserPhoneNumber, updateProfilePic, updateCoverPhoto as updateCoverPhotoService } from "../services/firebase/users.services";

export const updateName =  async ( req ) => {
    try {
        await updateUserName(req)

        return { 
            status: HttpStatus.OK, 
            message: "Name updated successfully" 
        };
    } catch (error) {
        console.error(`Name update Error: ${error.message}`);
        return { 
            status: HttpStatus.BAD_REQUEST, 
            message: error.message 
        };
    }
}

export const updatePhoneNumber = async ( req ) => {
    try{
        await updateUserPhoneNumber(req);

        return { 
            status: HttpStatus.OK, 
            message: "Phone number updated successfully" 
        };
    } catch (error){
        console.error(`Phone number Error: ${error.message}`);
        return { 
            status: HttpStatus.BAD_REQUEST, 
            message: error.message 
        };
    }
}

export const allUsers = ( reqCallback ) => {
    try {
        const unsubscribe = getAllUsers( reqCallback )

        return { 
            status: HttpStatus.OK, 
            message: "Users fetched",
            data: unsubscribe
        };
    } catch (error) {
        console.error(`User Fetch Error: ${error.message}`);
        return { 
            status: HttpStatus.BAD_REQUEST, 
            message: error.message 
        };
    }
}

export const getUserInfoFromFirestore = async ( uid ) => {
    try{
        const userData = await getUserDoc( uid )

        return {
            status: HttpStatus.OK,
            message: "Users fetched",
            data: userData
        };
    } catch (error) {
        console.error(`User info fetch Error: ${error.message}`);
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message
        };
    }
}

export const updateProfilePicture = async (req) => {
    try {
        const url = await updateProfilePic(req);

        return {
            status: HttpStatus.OK,
            message: "Profile picture updated successfully",
            profilePicUrl: url
        };
    } catch (error) {
        console.error(`Profile picture update Error: ${error.message}`);
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message
        };
    }
}

export const updateCoverPhoto = async (req) => {
    try {
        const url = await updateCoverPhotoService(req);

        return {
            status: HttpStatus.OK,
            message: "Cover photo updated successfully",
            coverPhotoUrl: url
        };
    } catch (error) {
        console.error(`Cover photo update Error: ${error.message}`);
        return {
            status: HttpStatus.BAD_REQUEST,
            message: error.message
        };
    }
}




