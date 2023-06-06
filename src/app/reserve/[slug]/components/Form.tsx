import useReservation from "@/hooks/useReservation";
import { useEffect, useState } from "react";

export default function Form() {
  const [inputs, setInputs] = useState({
    bookerFirstName: "",
    bookerLastName: "",
    bookerPhoneNumber: "",
    bookerEmail: "",
    occasion: "",
    requests: "",
  });

  const [disabled, setDisabled] = useState(true);
  const { error, loading, createReservation } = useReservation();

  useEffect(() => {
    if (
      inputs.bookerFirstName &&
      inputs.bookerLastName &&
      inputs.bookerPhoneNumber &&
      inputs.bookerEmail
    ) {
      return setDisabled(false);
    } else {
      return setDisabled(true);
    }
  }, [inputs]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mt-10 flex flex-wrap justify-between w-[660px]">
      <input
        type="text"
        className="border rounded p-3 w-80 mb-4"
        placeholder="First Name"
        name="bookerFirstName"
        value={inputs.bookerFirstName}
        onChange={handleChangeInput}
      />
      <input
        type="text"
        className="border rounded p-3 w-80 mb-4"
        placeholder="Last Name"
        name="bookerLastName"
        value={inputs.bookerLastName}
        onChange={handleChangeInput}
      />
      <input
        type="text"
        className="border rounded p-3 w-80 mb-4"
        placeholder="Phone number"
        name="bookerPhoneNumber"
        value={inputs.bookerPhoneNumber}
        onChange={handleChangeInput}
      />
      <input
        type="text"
        className="border rounded p-3 w-80 mb-4"
        placeholder="Email"
        name="bookerEmail"
        value={inputs.bookerEmail}
        onChange={handleChangeInput}
      />
      <input
        type="text"
        className="border rounded p-3 w-80 mb-4"
        placeholder="Occasion (optional)"
        name="occasion"
        value={inputs.occasion}
        onChange={handleChangeInput}
      />
      <input
        type="text"
        className="border rounded p-3 w-80 mb-4"
        placeholder="Requests (optional)"
        name="requests"
        value={inputs.requests}
        onChange={handleChangeInput}
      />
      <button
        disabled={disabled}
        className="bg-red-600 w-full p-3 text-white font-bold rounded disabled:bg-gray-300"
      >
        Complete reservation
      </button>
      <p className="mt-4 text-sm">
        By clicking “Complete reservation” you agree to the OpenTable Terms of
        Use and Privacy Policy. Standard text message rates may apply. You may
        opt out of receiving text messages at any time.
      </p>
    </div>
  );
}
