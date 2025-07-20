"use client";

import UserNavbar from "@/components/UserNavbar";
import withAuth from "../../hoc/withAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function UserDashboard() {
  const [courses, setCourses] = useState([]);
  const router = useRouter();

  const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res)
       if (res?.data?.success) setCourses(res?.data?.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div>
      <UserNavbar />

      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Available Chapters</h2>

        {courses.length === 0 && (
          <p className="text-gray-600">No chapters available.</p>
        )}

        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="flex justify-between items-center border border-gray-300 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/user/${course._id}/subcourses`)}
            >
              <div>
                <h3 className="text-lg font-bold">{course.title}</h3>
                <p className="text-gray-600">{course.description}</p>
              </div>
              <div className="flex-column items-center space-x-2">
                <p className="text-xl text-end me-0">➡️</p>
                <p className="text-sm text-gray-500">
                  Total Videos ({course.subCourses?.length || 0})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(UserDashboard, "user");
