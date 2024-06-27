import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { z } from "zod";
import { usernameValidation } from "@/Schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get("username"),
        };
        // Validate with Zod
        const result = usernameQuerySchema.safeParse(queryParams);

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(", ")
                    : "Invalid query parameter"
            }, { status: 400 })

        }

        const { username } = result.data;

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username, isVerified: true
        });

        if (existingUserVerifiedByUsername) {
            return new Response(JSON.stringify({
                success: false,
                message: "Username already taken"
            }), { status: 400 })
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Username is unique"
        }), { status: 200 })

    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({
                success: false,
                message: error.errors
            }), { status: 400 })
        }
        return new Response(JSON.stringify({
            success: false,
            message: "Error while checking username uniqueness"
        }), { status: 500 })
    }
}