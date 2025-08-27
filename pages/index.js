import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

export default function Home() {
  const [loginType, setLoginType] = useState("user");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  const handleChange = (e) => setFormData(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/auth/${loginType}-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful");
      window.location.href = loginType === "admin" ? "/admin/courses" : "/user/dashboard";
    } else {
      alert(data.message || "Login failed");
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwt.decode(token);
        if (decoded?.role === "admin") { router.replace("/admin/courses"); return; }
        if (decoded?.role === "user")  { router.replace("/user/dashboard"); return; }
      }
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <main className="min-h-screen bg-background grid place-items-center">
        <div className="text-center">
          <svg className="animate-spin h-6 w-6 mx-auto mb-3" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="4" fill="none" />
            <path fill="var(--brand)" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
          </svg>
          <p className="text-muted">Redirecting…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Brand side */}
      <aside className="brand-pane flex items-center justify-center p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-token">
        <div className="max-w-sm text-center lg:text-left">
          <img src="/logo.svg" alt="Your brand logo" className="h-10 w-auto mx-auto lg:mx-0 mb-6" />
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-foreground">
            Welcome to <span style={{ color: "var(--brand)" }}>YourApp</span>
          </h1>
          <p className="mt-3 text-muted">
            Short value prop lives here—2 lines max. Keep it crisp and benefit-focused.
          </p>
        </div>
      </aside>

      {/* Form side */}
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md card p-6 md:p-8 space-y-6">
          <header className="text-center">
            <h2 className="text-2xl font-extrabold text-foreground">Sign in</h2>
            <p className="text-sm text-muted mt-1">Use your account to continue</p>
          </header>

          {/* Segmented: User / Admin */}
          <div className="flex justify-center">
            <div className="segmented">
              <button
                type="button"
                className="seg-btn"
                data-active={loginType === "user"}
                onClick={() => setLoginType("user")}
                aria-pressed={loginType === "user"}
              >
                User
              </button>
              <button
                type="button"
                className="seg-btn"
                data-active={loginType === "admin"}
                onClick={() => setLoginType("admin")}
                aria-pressed={loginType === "admin"}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-1">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/90 mb-1">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-brand w-full mt-3">
              Login as {loginType[0].toUpperCase() + loginType.slice(1)}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
