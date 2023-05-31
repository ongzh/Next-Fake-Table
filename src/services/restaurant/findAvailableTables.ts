import { times } from "@/data/times";
import { PrismaClient, Table } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export const findAvailableTables = async ({
  time,
  day,
  restaurant,
}: {
  time: string;
  day: string;
  restaurant: {
    tables: Table[];
    open_time: string;
    close_time: string;
  };
}) => {
  //get range of times associate with selected time
  const searchTimes = times.find((t) => {
    return t.time === time;
  })?.searchTimes;

  if (!searchTimes) {
    return null;
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

  return searchTimesWithTables;
};
