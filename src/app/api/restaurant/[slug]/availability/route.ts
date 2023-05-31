import { NextResponse, NextRequest } from "next/server";
import { times } from "../../../../../data";

import { PrismaClient } from "@prisma/client";
import { SlugParam } from "../types";
import { findAvailableTables } from "@/services/restaurant/findAvailableTables";
const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: SlugParam) {
  //retrive slug from the passed in params object
  const slug = params.slug;
  const day = req.nextUrl.searchParams.get("day");
  const time = req.nextUrl.searchParams.get("time");
  const partySize = req.nextUrl.searchParams.get("partySize");

  if (!day || !time || !partySize) {
    return NextResponse.json(
      { errorMessage: "Please provide day, time and partySize" },
      { status: 400 }
    );
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
    },
    select: {
      tables: true,
      open_time: true,
      close_time: true,
    },
  });

  if (!restaurant) {
    return NextResponse.json(
      { errorMessage: "Invalid data provided" },
      { status: 400 }
    );
  }

  const searchTimesWithTables = await findAvailableTables({
    time,
    day,
    restaurant,
  });

  if (!searchTimesWithTables) {
    return NextResponse.json(
      { errorMessage: "Invalid data provided" },
      { status: 400 }
    );
  }
  //avaialable seats based on partysize and time selected
  const availabilities = searchTimesWithTables
    .map((t) => {
      //start with 0 as sum and add all seats from each table
      const sumSeats = t.tables.reduce((sum, table) => {
        return sum + table.seats;
      }, 0);
      return {
        time: t.time,
        availableSeats: sumSeats >= parseInt(partySize as string),
      };
    })
    .filter((avail) => {
      const timeIsAfterOpeningHour =
        new Date(`${day}T${avail.time}`) >=
        new Date(`${day}T${restaurant.open_time}`);
      const timeIsBeforeClosingHour =
        new Date(`${day}T${avail.time}`) <=
        new Date(`${day}T${restaurant.close_time}`);
      return timeIsAfterOpeningHour && timeIsBeforeClosingHour;
    });

  return NextResponse.json(availabilities);
}

//test api url
//http://localhost:3000/api/restaurant/vivaan-fine-indian-cuisine-ottawa/availability?day=2023-07-27&time=15:00:00.000Z&partySize=4
