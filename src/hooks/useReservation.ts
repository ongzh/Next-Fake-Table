import { useEffect, useState } from "react";
import axios from "axios";
export default function useReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReservation = async ({
    slug,
    day,
    time,
    partySize,
    bookerFirstName,
    bookerLastName,
    bookerPhoneNumber,
    bookerEmail,
    occasion,
    requests,
  }: {
    slug: string;
    day: string;
    time: string;
    partySize: number;
    bookerFirstName: string;
    bookerLastName: string;
    bookerPhoneNumber: string;
    bookerEmail: string;
    occasion: string;
    requests: string;
  }) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/restaurant/${slug}/reserve`,
        {
          bookerFirstName,
          bookerLastName,
          bookerPhoneNumber,
          bookerEmail,
          occasion,
          requests,
        },
        //add query params
        {
          params: {
            day,
            time,
            partySize,
          },
        }
      );
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      setError(error.response.data.errorMessage);
    }
  };
  return { loading, error, createReservation };
}
