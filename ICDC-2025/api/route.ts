import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const KEYCLOAK_CERTS_URL = "http://www.team12.isucdc.com:8080/realms/CyberPrint/protocol/openid-connect/certs";

// Function to fetch the public key from Keycloak's JWKS endpoint
async function getKeycloakPublicKey(kid: string): Promise<string> {
    
    // Fetch the JWKS (JSON Web Key Set) from Keycloak
    const res = await fetch(KEYCLOAK_CERTS_URL);
    const { keys } = await res.json(); // Parse the response JSON to extract keys
  
    // Find the key with the matching Key ID (kid)
    type JWK = { kid: string; x5c: string[] }; // Define JWK type
    const key = keys.find((key: JWK) => key.kid === kid);
    if (!key) throw new Error("Key ID not found in Keycloak JWKS");
  
    // Return the public key in PEM format
    return `-----BEGIN PUBLIC KEY-----\n${key.x5c[0]}\n-----END PUBLIC KEY-----`;
}
  
async function validateToken(token: string): Promise<JwtPayload | null> {
    try {
        // Decode the JWT Header to get the Key ID = kid
        const decodedHeader = jwt.decode(token, { complete: true }) as { header: { kid: string } } | null;

        if (!decodedHeader) throw new Error("Invalid token format");

        // Retrieve the correct public key from Keycloak based on the Key ID (kid)
        const publicKey = await getKeycloakPublicKey(decodedHeader.header.kid);

        // Verify the JWT using the public key and expected algorithm (RS256)
        return jwt.verify(token, publicKey, { algorithms: ["RS256"] }) as JwtPayload;

    } catch (error) {
        console.error("Token verification failed:", error);
        return null; // Verification failed -> null suckersss
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get Auth Header from the request
        const authHeader = request.headers.get("Authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract Token
        const token = authHeader.split(" ")[1]; // Splitting by space

        // Validate the token to get the payload (user data)
        const payload = await validateToken(token);

        // If the token is invalid or expired -> deny that hoe
        if (!payload) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
        }

        // If token is VALID, return success response with user payload
        return NextResponse.json({ message: "Token is valid", user: payload });

    } catch (error) {
        console.error("API Error:", error); // Now using error to avoid the unused variable warning
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
