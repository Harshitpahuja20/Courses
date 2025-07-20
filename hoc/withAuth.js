import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

export default function withAuth(Component, allowedRole) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const decoded = jwt.decode(token);
        if (decoded.role !== allowedRole) {
          router.replace("/");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Invalid token");
        router.replace("/");
      }
    }, []);

    if (loading) return <p>Loading...</p>;

    return <Component {...props} />;
  };
}
