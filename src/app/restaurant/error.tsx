"use client";

import Image from "next/image";
import errorLogo from "../../../public/icons/error.png";
export default function error({ error }: { error: Error }) {
  return (
    <div className="h-screen bg-gray-200 flex flex-col justify-center items-center">
      <Image src={errorLogo} alt="error" className="w-56 mb-8" />
      <div className="bg-white px-9 py-14 shadow rounded">
        <h3 className="text-3xl font-bold">
          Oops, looks like an Error Occured
        </h3>
        <p className="mt-6 text-sm font-light">{error.message}</p>
        <p className="mt-6 text-sm font-light">Error Code: 400</p>
      </div>
    </div>
  );
}
