"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import UserNavbar from "@/components/UserNavbar";
import withAuth from "@/hoc/withAuth";

function SubCoursesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState(null);
  const [subcourses, setSubcourses] = useState([]);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    axios
      .get(`/api/subcourse/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCourse(res.data.course);
        setSubcourses(res.data.subcourses);
      });
  }, [id]);

  if (!course) return <p className="p-4">Loading...</p>;

  return (
    <>
      <UserNavbar />
      <div className="w-full mx-auto p-6">
        {/* Course Details */}
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-semibold mb-2">{course.title}</h1>
          <p className="text-gray-200 mb-2">{course.description}</p>
          <div className="text-sm text-gray-300 space-y-1">
            <p>Total Subcourses: {subcourses.length}</p>
          </div>
        </div>

        {/* Flex container for Form and Table */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Subcourse List */}
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Subcourses List
            </h2>
            {subcourses.length === 0 ? (
              <p className="text-gray-500">No subcourses added yet.</p>
            ) : (
              <div className="space-y-4">
                {subcourses.map((course) => (
                  <div
                    key={course._id}
                    className="flex justify-between items-center border border-gray-300 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() =>
                      router.push(`/user/${course._id}/subcourses`)
                    }
                  >
                    <div>
                      <h3 className="text-lg font-bold">{course.title}</h3>
                      <p className="text-gray-600">{course.description}</p>
                    </div>
                    <div className="flex-column items-center space-x-2">
                      <p className="text-xl text-end me-0">▶️</p>
                      <p className="text-sm text-gray-500">
                        Play Now!
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(SubCoursesPage, "user");