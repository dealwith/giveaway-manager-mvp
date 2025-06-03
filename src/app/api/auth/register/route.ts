import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/config/firebase";
import { createUser } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/sendWelcomeEmail";
import { SignUpSchema } from "@/utils/validate/SignUpSchema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignUpSchema.parse(body);

    const { email, password, name } = parsed;

    if (!auth) {
      return NextResponse.json({ error: "Authentication not initialized" }, { status: 500 });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (name) {
      await updateProfile(user, { displayName: name });
    }

    await createUser({
      email,
      name,
      provider: "credentials",
    });

    await sendWelcomeEmail(email, name);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code: string }).code === "auth/email-already-in-use") {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Unexpected error during registration:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}