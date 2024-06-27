import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";


export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: "User not found"
            }), { status: 404 })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeExpired = new Date(user.verifyCodeExpires) < new Date();

        if (isCodeValid && isCodeExpired) {
            user.isVerified = true;
            await user.save();

            return new Response(JSON.stringify({
                success: true,
                message: "User verified successfully"
            }), { status: 200 })
        } else if (!isCodeValid) {
            return new Response(JSON.stringify({
                success: false,
                message: "Verification code is expires, please signup again"
            }), { status: 400 })
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: "Verification code is invalid"
            }), { status: 400 })
        }

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({
            success: false,
            message: "Error while checking username uniqueness"
        }), { status: 500 })
    }
}