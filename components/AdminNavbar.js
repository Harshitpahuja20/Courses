"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

const navItems = [
  { name: "Users", href: "/admin/users" },
  { name: "Courses", href: "/admin/courses" },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  const router = useRouter();

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Redirect to login
    router.push("/");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="text-xl font-bold">
        <Link href="/admin/users">
          <span className="cursor-pointer">DataCourses</span>
        </Link>
      </div>
      <div className="flex space-x-6 items-center">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              className={`cursor-pointer hover:text-gray-400 transition ${
                pathname === item.href ? "text-blue-400" : ""
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
