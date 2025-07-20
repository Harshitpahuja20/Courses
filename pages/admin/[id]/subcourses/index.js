"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import AdminNavbar from "@/components/AdminNavbar";
import withAuth from "@/hoc/withAuth";

function SubCoursesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState(null);
  const [subcourses, setSubcourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    gdriveUrl: "",
    index: "",
  });

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`/api/subcourse/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    console.log(res)
    if (!res.ok) {
      return alert("Failed to create subcourse");
    }

    const data = await res.json();
    setSubcourses([...subcourses, data]);
    setForm({ title: "", description: "", gdriveUrl: "", index: "" });
  } catch (err) {
    console.error(err);
    // optionally handle error UI here
  }
};


  if (!course) return <p className="p-4">Loading...</p>;

  return (
    <>
      <AdminNavbar />
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
          {/* Add Subcourse Form */}
          <div className="w-full lg:w-1/2 bg-white p-6 shadow-md rounded-lg border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add New Subcourse
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Subcourse Title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-2/3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                  required
                />
                <input
                  type="number"
                  name="index"
                  placeholder="Index"
                  value={form.index}
                  onChange={handleChange}
                  className="w-1/3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                  required
                />
              </div>
              <textarea
                name="description"
                placeholder="Subcourse Description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
              <input
                type="url"
                name="gdriveUrl"
                placeholder="Google Drive Link"
                value={form.gdriveUrl}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Add Subcourse
              </button>
            </form>
          </div>

          {/* Subcourse List */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Subcourses List
            </h2>
            {subcourses.length === 0 ? (
              <p className="text-gray-500">No subcourses added yet.</p>
            ) : (
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-left">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="p-3">Index</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcourses
                      .sort((a, b) => a.index - b.index)
                      .map((sub) => (
                        <tr key={sub._id} className="border-t hover:bg-gray-50">
                          <td className="p-3">{sub.index}</td>
                          <td className="p-3">{sub.title}</td>
                          <td className="p-3">{sub.description}</td>
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

export default withAuth(SubCoursesPage, "admin");
