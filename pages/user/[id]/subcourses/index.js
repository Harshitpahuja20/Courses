"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import UserNavbar from "../../../../components/UserNavbar";
import withAuth from "../../../../hoc/withAuth";
import VideoModal from "../../../../components/viewModal"; // Adjust path if needed
import { jwtDecode } from "jwt-decode";

function SubCoursesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState(null);
  const [subcourses, setSubcourses] = useState([]);
  const [selectedGDriveId, setSelectedGDriveId] = useState(null);

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
            <p>Total Chapters: {subcourses.length}</p>
          </div>
        </div>

        {/* Flex container for Form and Table */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Subcourse List */}
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Chapters List
            </h2>
            {subcourses.length === 0 ? (
              <p className="text-gray-500">No subcourses added yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {subcourses.map((course) => {
                  let fileId = null;

                  try {
                    const decoded = jwtDecode(course.gdriveUrl);
                    const gdriveUrl = decoded?.gdriveUrl;
                    const match = gdriveUrl?.match(/\/file\/d\/(.*?)\//);
                    fileId = match?.[1];
                  } catch (e) {
                    console.warn("Invalid JWT for gdriveUrl");
                  }

                  return (
                    <div
                      key={course._id}
                      onClick={() => fileId && setSelectedGDriveId(fileId)}
                      className="cursor-pointer rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300"
                    >
                      <div
                        className="md:h-80 h-60 bg-cover bg-center relative"
                        style={{
                          backgroundImage: fileId
                            ? `url(https://lh3.googleusercontent.com/d/${fileId}=s640)`
                            : `url(/placeholder.jpg)`,
                        }}
                      >
                        {/* <img src={`https://lh3.googleusercontent.com/d/${fileId}=s220`} /> */}
                        <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white p-2 text-sm font-semibold">
                          {course.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedGDriveId && (
        <VideoModal
          gdriveId={selectedGDriveId}
          onClose={() => setSelectedGDriveId(null)}
        />
      )}
    </>
  );
}

export default withAuth(SubCoursesPage, "user");
