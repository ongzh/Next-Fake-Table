import NavBar from "@/app/components/NavBar";
import Link from "next/link";
import RestaurantNavBar from "../components/RestaurantNavBar";
import Menu from "../components/Menu";
import Header from "../components/Header";

export default function RestaurantMenu() {
  return (
    <>
      <div className="bg-white w-[100%] rounded p-3 shadow">
        {/* RESAURANT NAVBAR */}
        <RestaurantNavBar />
        <Menu />
      </div>
    </>
  );
}
