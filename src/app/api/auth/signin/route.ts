import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as jose from "jose";
import { setCookie } from "cookies-next";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const errors: string[] = [];
  const validationSchema = [
    {
      valid: validator.isEmail(email),
      errorMessage: "Email is Invalid",
    },
    {
      valid: validator.isLength(password, { min: 1 }),
      errorMessage: "Password is Invalid",
    },
  ];

  validationSchema.forEach((validation) => {
    if (!validation.valid) {
      errors.push(validation.errorMessage);
    }
  });

  if (errors.length > 0) {
    return NextResponse.json({ errorMessage: errors[0] }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return NextResponse.json(
      { errorMessage: "Email or password is invalid" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      { errorMessage: "Email or password is invalid" },
      { status: 401 }
    );
  }

  const algo = "HS256";
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new jose.SignJWT({
    email: user.email,
  })
    .setProtectedHeader({ alg: algo })
    .setExpirationTime("24h")
    .sign(secret);

  const userResponse = {
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone_number: user.phone_number,
    city: user.city,
  };
  return NextResponse.json(userResponse, {
    status: 200,
    headers: {
      "Set-Cookie": `jwt=${token}; Max-age=24*60*60; Path=/`,
    },
  });
}
