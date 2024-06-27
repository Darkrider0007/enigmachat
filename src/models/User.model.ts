import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the Message interface extending Document
export interface Message extends Document {
    content: string;
    createdAt: Date;
}

// Define the MessageSchema with proper type annotations
const MessageSchema: Schema<Message> = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// Define the User interface extending Document
export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpires: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}

// Define the UserSchema with proper type annotations and validations
const UserSchema: Schema<User> = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    verifyCode: {
        type: String,
        required: [true, 'Verify Code is required'],
    },
    verifyCodeExpires: {
        type: Date,
        required: [true, 'Verify Code Expiry is required'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    messages: [MessageSchema],
});

// Create and export the UserModel
const UserModel: Model<User> =
    mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;
