import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken"

export default function Home() {
  const [loginType, setLoginType] = useState("user");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/auth/${loginType}-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful");
      window.location.href =
        loginType === "admin" ? "/admin/courses" : "/user/dashboard";
    } else {
      alert(data.message || "Login failed");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.role === "admin") {
        router.replace("/admin/courses");
      } else if (decoded?.role === "user") {
        router.replace("/user/dashboard");
      }
    } else {
      setIsChecking(false);
    }
  }, []);

  if (isChecking) return <p>Redirecting...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setLoginType("user")}
            className={`px-4 py-2 rounded ${
              loginType === "user"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setLoginType("admin")}
            className={`px-4 py-2 rounded ${
              loginType === "admin"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-blue-700 text-white py-2 rounded transition"
          >
            Login as {loginType.charAt(0).toUpperCase() + loginType.slice(1)}
          </button>
        </form>
      </div>
    </div>
  );
}
