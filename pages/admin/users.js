"use client";

import AdminNavbar from "@/components/AdminNavbar";
import { useEffect, useState } from "react";
import withAuth from "../../hoc/withAuth";

function AdminUsersPage() {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/users/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    if (result.success) {
      alert("✅ User created");
      setForm({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } else {
      alert(result.error || "❌ Failed to create user");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="w-full mx-auto">
          <div className="bg-white rounded-lg shadow p-6 space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">
              ➕ Add New User
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <input
                type="text"
                placeholder="Name"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
              >
                Add User
              </button>
            </form>
          </div>

          <div className="mt-10 bg-white rounded-lg shadow p-6 ">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              👥 User List
            </h2>
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-800 text-white uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-6 text-gray-500"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-6 text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{u.name}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminUsersPage, "admin");
