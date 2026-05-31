import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isBlocked: { 
        type: Boolean, 
        required: true, 
        default: false 
    },     
    isEmailVerified: { 
        type: Boolean, 
        required: true, 
        default: false 
    }, 
    image: { 
        type: String, 
        required: false,
        default: ""  // Changed from false to empty string for image path
    }
});

export default mongoose.model("User", userSchema);