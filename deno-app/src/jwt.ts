import { jwtVerify, SignJWT } from "https://deno.land/x/jose@v5.9.4/index.ts";
import { config } from "./config.ts";

const secret = new TextEncoder().encode(config.dbName);

export type JwtPayload = { email: string; userId: number | null };

export async function createJWT(payload: JwtPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1year")
        .sign(secret);
}

const getTokenFromHeaders = (req: Request) => {
    return (req.headers.get("Authorization") || "").split("Bearer ")[1] || "";
};

export async function verifyJWT(
    req: Request
): Promise<JwtPayload> {
   const token = getTokenFromHeaders(req);
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as JwtPayload;
    } catch (_) {
        return { email: "", userId: null };
    }
}