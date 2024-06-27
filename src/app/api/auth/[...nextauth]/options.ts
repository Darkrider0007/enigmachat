import bcrypt from 'bcryptjs';
import { AuthOptions, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User.model';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { username: credentials.identifier },
                            { email: credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error('No user found');
                    }

                    if (!user.isVerified) {
                        throw new Error('User not verified');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordCorrect) {
                        throw new Error('Password incorrect');
                    }

                    return user;

                } catch (error: any) {
                    throw new Error(error);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user._id?.toString();
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
                token.isVerified = user.isVerified;
            }
            return token;

        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
                session.user.isVerified = token.isVerified;
            }
            return session;
        }
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXT_AUTH_SECRET
}