import { NextResponse } from "next/server";
import { UserRepository } from "lib/userRepository";
import { verifyToken } from "lib/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Forbidden Access" }, { status: 403 });
    }

    const faculty = await UserRepository.findByRole("faculty");
    
    return NextResponse.json({ faculty });
  } catch (error) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
