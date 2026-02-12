import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode("meca-dashboard-secret-key-2026");

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (username === process.env.AUTHORIZATION_USER && password === process.env.AUTHORIZATION_PASSWORD) {
            const token = await new SignJWT({ username })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("24h")
                .sign(SECRET_KEY);

            const response = NextResponse.json(
                { message: "Login successful" },
                { status: 200 }
            );

            response.cookies.set("auth-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24, // 1 day
                path: "/",
            });

            return response;
        }

        return NextResponse.json(
            { error: "Usuario o contraseña inválidos" },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Error en el servidor" },
            { status: 500 }
        );
    }
}
