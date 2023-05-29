import { NextResponse, NextRequest } from "next/server";
import { times } from "../../../../../data";

type SlugParam = {
  params: {
    slug: string;
  };
};

import { PrismaClient } from "@prisma/client";
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
  //get range of times associate with selected time
  const searchTimes = times.find((t) => {
    return t.time === time;
  })?.searchTimes;

  if (!searchTimes) {
    return NextResponse.json(
      { errorMessage: "Please provide a valid time" },
      { status: 400 }
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      booking_time: {
        gte: new Date(`${day}T${searchTimes[0]}`),
        lte: new Date(`${day}T${searchTimes[searchTimes.length - 1]}`),
      },
    },
    select: {
      booking_time: true,
      number_of_people: true,
      booking_tables: true,
    },
  });
  //list of bookings based on time: table_id: true
  //key is any string, value is :{with key of number and value always true}
  const bookingTablesObj: { [key: string]: { [key: number]: true } } = {};

  bookings.forEach((booking) => {
    bookingTablesObj[booking.booking_time.toISOString()] =
      booking.booking_tables.reduce((obj, table) => {
        return {
          ...obj,
          [table.table_id]: true,
        };
      }, {});
  });

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

  const tables = restaurant.tables;
  //map each time in searchtime to the tables array with tables that are available
  const searchTimesWithTables = searchTimes.map((searchTime) => {
    return {
      date: new Date(`${day}T${searchTime}`),
      time: searchTime,
      tables,
    };
  });
  //filter out tables that are not available
  searchTimesWithTables.forEach((t) => {
    t.tables = t.tables.filter((table) => {
      //check with bookingTableObj, if booking exist on that table dont include
      if (bookingTablesObj[t.date.toISOString()]) {
        if (bookingTablesObj[t.date.toISOString()][table.id]) {
          return false;
        }
      }
      return true;
    });
  });
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

  return NextResponse.json({
    searchTimes,
    bookings,
    bookingTablesObj,
    tables,
    searchTimesWithTables,
    availabilities,
  });
}

//test api url
//http://localhost:3000/api/restaurant/vivaan-fine-indian-cuisine-ottawa/availability?day=2023-07-27&time=15:00:00.000Z&partySize=4
