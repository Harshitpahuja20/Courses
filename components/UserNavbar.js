"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="text-xl font-bold">
        <Link href="/user/dashboard">
          <span className="cursor-pointer">DataCourses</span>
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition"
      >
        Logout
      </button>
    </nav>
  );
}
