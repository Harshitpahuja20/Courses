"use client";

import UserNavbar from "../../components/UserNavbar";
import withAuth from "../../hoc/withAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function UserDashboard() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data?.success) setCourses(res?.data?.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <UserNavbar />

      <main className="px-4 md:px-6 lg:px-8 py-6">
        <header className="mb-6 md:mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">All topics</h2>
            <p className="text-muted mt-1">Browse your available courses</p>
          </div>

          {/* optional: manual refresh */}
          <button
            onClick={fetchCourses}
            className="btn btn-ghost"
            aria-label="Refresh list"
            title="Refresh"
          >
            Refresh
          </button>
        </header>

        {/* Loading skeletons */}
        {isLoading && (
          <div
            className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card p-5 animate-pulse"
                role="status"
                aria-label="Loading card"
              >
                <div className="h-5 w-2/3 mb-3 rounded bg-[var(--elev-2)]" />
                <div className="h-4 w-full mb-2 rounded bg-[var(--elev-2)]" />
                <div className="h-4 w-5/6 rounded bg-[var(--elev-2)]" />
                <div className="mt-6 h-10 w-36 rounded bg-[var(--elev-2)]" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div className="card p-5 border-token text-sm">
            <p className="text-red-400 font-semibold">Couldn’t load topics.</p>
            <p className="text-muted mt-1">
              Please check your connection and try again.
            </p>
            <div className="mt-4">
              <button onClick={fetchCourses} className="btn btn-brand">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && courses.length === 0 && (
          <div className="card p-8 text-center border-token">
            <h3 className="text-xl font-bold">No topics available</h3>
            <p className="text-muted mt-1">
              When courses are added to your account, they’ll appear here.
            </p>
          </div>
        )}

        {/* Courses grid */}
        {!isLoading && !isError && courses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course._id}
                className="card group border-token p-5 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {course.title}
                  </h3>
                  <p className="text-muted mt-1 line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => router.push(`/user/${course._id}/subcourses`)}
                    className="btn btn-ghost"
                    style={{ borderColor: "var(--border)" }}
                  >
                    View Chapters
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(UserDashboard, "user");
