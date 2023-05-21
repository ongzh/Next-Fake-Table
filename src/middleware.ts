import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest, res: NextResponse) {
  console.log("THIS IS THEMNIDDLEAWLWAR MTREGERM");

  const bearerToken = req.headers.get("authorization");

  if (!bearerToken) {
    return NextResponse.json(
      { errorMessage: "Unauthorized request (no bearer token)" },
      { status: 401 }
    );
  }

  const token = bearerToken.split(" ")[1];
  if (!token) {
    return NextResponse.json(
      { errorMessage: "Unauthorized reques" },

      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    await jose.jwtVerify(token, secret);
  } catch (e) {
    return NextResponse.json(
      { errorMessage: "Unauthorized request (invalid JWT token)" },
      { status: 401 }
    );
  }
}

//only call middleware on certain request
export const config = {
  matcher: ["/api/auth/me"],
};
