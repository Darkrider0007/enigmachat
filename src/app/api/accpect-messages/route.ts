import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";

export async function POST(request: Request) {
    dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, {
            status: 401
        })
    }

    const userId = user.id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            })
        }

        return Response.json({
            success: true,
            message: "User status for accepting messages updated successfully"
        }, {
            status: 200
        })

    } catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "Failed to update user status for accepting messages"
        }, {
            status: 500
        })
    }
}

export async function GET(request: Request) {
    dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, {
            status: 401
        })
    }

    const userId = user.id;
    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            })
        }

        return Response.json({
            success: true,
            message: "User found",
            data: {
                acceptMessages: foundUser.isAcceptingMessages
            }
        }, {
            status: 200
        })
    } catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "Failed to get user status for accepting messages"
        }, {
            status: 500
        })

    }


}