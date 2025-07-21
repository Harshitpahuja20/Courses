import { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import withAuth from "../../hoc/withAuth";
import {router} from "next/router"

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "" });
  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: "", description: "" });
      fetchCourses(); // Refresh list
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="p-6 sm:p-8 bg-gray-100 min-h-screen">
        <div className="w-[100%] mx-auto space-y-8">
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              ➕ Add New Course
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Course Title"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Course Description"
                  className="w-full border border-gray-300 rounded px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
              >
                Add Course
              </button>
            </form>
          </div>

          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📚 Course List
            </h2>

            {loading ? (
              <p className="text-gray-600">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="text-gray-500 italic">
                No courses available. Add a new course to get started.
              </p>
            ) : (
              <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-800 text-white uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-center">Add</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr
                        key={course._id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {course.title}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {course.description}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-white hover:bg-gray-700"
                            title="Add subcourse"
                            onClick={() =>
                              router.push(
                                `/admin/${course._id}/subcourses`
                              )
                            } // or any action
                          >
                            +
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(CoursesPage, "admin");
