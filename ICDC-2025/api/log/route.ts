import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Received POST request:", body);

        return NextResponse.json({ message: "Logged successfully" }, { status: 200 });
        
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
