import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as jose from "jose";
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const { firstName, lastName, email, phoneNumber, city, password } =
    await req.json();
  const errors: string[] = [];
  const validationSchema = [
    {
      valid: validator.isLength(firstName, {
        min: 1,
        max: 20,
      }),
      errorMessage: "First name is Invalid",
    },
    {
      valid: validator.isLength(lastName, { min: 1, max: 20 }),
      errorMessage: "Last name is Invalid",
    },
    { valid: validator.isEmail(email), errorMessage: "Email is Invalid" },
    {
      valid: validator.isMobilePhone(phoneNumber),
      errorMessage: "Phone number is Invalid",
    },
    {
      valid: validator.isLength(city, { min: 1 }),
      errorMessage: "City is Invalid",
    },
    {
      valid: validator.isStrongPassword(password),
      errorMessage: "Password is not strong enough",
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

  const userWithEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userWithEmail) {
    return NextResponse.json(
      { errorMessage: "User with this email already exists" },
      { status: 400 }
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      password: hashedPassword,
      email,
      phone_number: phoneNumber,
      city,
    },
  });

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
