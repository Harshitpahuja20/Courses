"use client";

import UserNavbar from "../../components/UserNavbar";
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
      console.log(res);
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
        <h2 className="text-2xl font-semibold mb-4">All topics</h2>

        {courses.length === 0 && (
          <p className="text-gray-600">No topics available.</p>
        )}

        <div className="grid gap-15 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="border border-gray-300 rounded-lg flex flex-col justify-between min-h-[220px]"
            >
              {/* Title & Description */}
              <div className=" p-4 mt-auto">
                <h3 className="text-lg font-semibold text-gray-900">
                  {course.title}
                </h3>
                <p className="text-gray-600">{course.description}</p>
              </div>

              {/* Bottom: View Link */}
              <div
                onClick={() => router.push(`/user/${course._id}/subcourses`)}
                className="p-4 text-white bg-gray-800 rounded-br-lg rounded-bl-lg cursor-pointer hover:underline flex items-center justify-start border-t border-gray-400 pt-2"
              >
                <span className="text-md">View Chapters</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(UserDashboard, "user");
