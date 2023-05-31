import { NextRequest, NextResponse } from "next/server";
import { SlugParam } from "../types";
import { PrismaClient } from "@prisma/client";
import { findAvailableTables } from "@/services/restaurant/findAvailableTables";

const prisma = new PrismaClient();
export async function POST(req: NextRequest, { params }: SlugParam) {
  const slug = params.slug;
  const day = req.nextUrl.searchParams.get("day");
  const time = req.nextUrl.searchParams.get("time");
  const partySize = req.nextUrl.searchParams.get("partySize");
  const {
    bookerEmail,
    bookerPhoneNumber,
    bookerFirstName,
    bookerLastName,
    bookerOccasion,
    bookerRequest,
  } = await req.json();
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
      id: true,
    },
  });

  if (!restaurant) {
    return NextResponse.json(
      { errorMessage: "Invalid data provided" },
      { status: 400 }
    );
  }

  if (
    new Date(`${day}T${time}`) < new Date(`${day}T${restaurant.open_time}`) ||
    new Date(`${day}T${time}`) > new Date(`${day}T${restaurant.close_time}`)
  ) {
    return NextResponse.json(
      { errorMessage: "Please provide a valid time" },
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
  //tables available for specific time
  const searchTimeWithTables = searchTimesWithTables.find((t) => {
    return t.date.toISOString() === new Date(`${day}T${time}`).toISOString();
  });

  if (!searchTimeWithTables) {
    return NextResponse.json(
      { errorMessage: "Unable to book due to no availability" },
      { status: 400 }
    );
  }

  const tablesCount: {
    2: number[];
    4: number[];
  } = {
    2: [],
    4: [],
  };
  //only table with 2 or 4 seats are available in restaurant
  searchTimeWithTables.tables.forEach((table) => {
    if (table.seats === 2) {
      tablesCount[2].push(table.id);
    } else if (table.seats === 4) {
      tablesCount[4].push(table.id);
    }
  });

  const tablesToBook: number[] = [];
  let seatsRemaining = Number(partySize);

  while (seatsRemaining > 0) {
    //book table of 4
    if (seatsRemaining >= 3) {
      if (tablesCount[4].length > 0) {
        tablesToBook.push(tablesCount[4].pop()!);
        seatsRemaining -= 4;
      }
    } else {
      //book table of 2
      if (tablesCount[2].length > 0) {
        tablesToBook.push(tablesCount[2].pop()!);
        seatsRemaining -= 2;
        //if 2s full book then book 4man table even if 2ppl
      } else {
        tablesToBook.push(tablesCount[4].pop()!);
        seatsRemaining -= 4;
      }
    }
  }

  const booking = await prisma.booking.create({
    data: {
      booking_time: new Date(`${day}T${time}`),
      number_of_people: Number(partySize),
      booker_email: bookerEmail,
      booker_phone_number: bookerPhoneNumber,
      booker_first_name: bookerFirstName,
      booker_last_name: bookerLastName,
      booker_occasion: bookerOccasion,
      booker_request: bookerRequest,
      restaurant_id: restaurant.id,
    },
  });
  const bookingsAtTableData = tablesToBook.map((tableId) => {
    return {
      table_id: 1,
      booking_id: booking.id,
    };
  });

  await prisma.bookingsAtTable.createMany({
    data: bookingsAtTableData,
  });

  return NextResponse.json({
    booking,
  });
}

//http://localhost:3000/api/restaurant/vivaan-fine-indian-cuisine-ottawa/reserve?day=2023-07-27&time=15:00:00.000Z&partySize=4
