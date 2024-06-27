import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();

        // Check if username is already taken by a verified user
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingUserVerifiedByUsername) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Username already taken',
                }),
                { status: 400 }
            );
        }

        // Generate verification code
        const verifyCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Check if email is already taken
        const existingUserVerifiedByEmail = await UserModel.findOne({
            email,
        });

        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: 'Email already taken',
                    }),
                    { status: 400 }
                );
            } else {
                // Update existing unverified user
                const hashedPassword = await bcrypt.hash(password, 12);
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpires = new Date(Date.now() + 3600000);
                await existingUserVerifiedByEmail.save();
            }
        } else {
            // Create new user
            const hashedPassword = await bcrypt.hash(password, 12);

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const user = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpires: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            });

            await user.save();
        }

        // Send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: emailResponse.message,
                }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'User registered successfully. Please verify your email.',
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in sign-up route:', error);

        if (error instanceof Error) {
            if (error.name === 'ValidationError') {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: error.message,
                    }),
                    { status: 400 }
                );
            }

            return new Response(
                JSON.stringify({
                    success: false,
                    message: error.message,
                }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({
                success: false,
                message: 'Unknown error occurred',
            }),
            { status: 500 }
        );
    }
}
