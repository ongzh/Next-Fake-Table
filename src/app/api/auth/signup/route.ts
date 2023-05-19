import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const { firstName, lastName, email, phone_number, city, password } =
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
      valid: validator.isMobilePhone(phone_number),
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

  return NextResponse.json({ name: "John Doe" });
}
