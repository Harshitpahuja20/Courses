import { useEffect } from "react";
import { useRouter } from "next/router";
import { authenticatePublic } from "../../../lib/authMiddleware";

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const tokenUser = authenticatePublic(token);

      if (tokenUser) {
        if (tokenUser?.role === "admin") {
          router.replace("/admin/courses");
        } else if (tokenUser?.role === "user") {
          router.replace("/user/dashboard");
        } else {
          localStorage.removeItem("token");
          router.replace("/");
        }
      } else {
        localStorage.removeItem("token");
        router.replace("/");
      }
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>404 - Page Not Found</h1>
      <p>Redirecting you...</p>
    </div>
  );
}
