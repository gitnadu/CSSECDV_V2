import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/userRepository";

export async function GET(req) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[Auth] GetUserById error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
