import { NextResponse, NextRequest } from "next/server";
import { times } from "../../../../../data";

type SlugParam = {
  params: {
    slug: string;
  };
};

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

  const searchTimes = times.find((t) => {
    return t.time === time;
  })?.searchTimes;

  if (!searchTimes) {
    return NextResponse.json(
      { errorMessage: "Please provide a valid time" },
      { status: 400 }
    );
  }

  return NextResponse.json({ slug, day, time, partySize });
}

//http://localhost:3000/api/restaurant/kamasutra-indian-restaurant-and-wine-bar-niagara/availability?day=2023-01-01&time=20:00:00.000Z&partySize=4
