"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ServerFlagButton } from "../components/server-flag-button";

export default function AdminPage() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);


  const logAccess = () => {
    fetch("/api/log", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken || ""}`, // Add JWT token if needed
        },
        body: JSON.stringify({
            message: "Admin page accessed",
            user: session?.user?.email || "Unknown User",
        }),
    })
    .then((res) => res.json())
    .then((data) => console.log("Logging Response:", data)) // Fixed console.log
    .catch((error) => console.error("Logging error:", error));
};


  useEffect(() => {
    const verifyToken = async () => {
      if (session?.accessToken) {
        try {
          // Call API to validate token
          const response = await fetch("/api/jwt-auth", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Token is invalid or expired");
          }

          const data = await response.json();

          // Ensure the user's email matches the admin email
          if (data.user?.email?.toLowerCase() === "admin@cyberprint.com") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    verifyToken();
  }, [session]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-12 text-white tracking-tight">
            Unauthorized Access
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-5xl font-bold text-center mb-12 text-white tracking-tight">
          Admin Dashboard
        </h1>

        <div className="bg-blue-800 border border-blue-500 rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Random Flag:
          </h2>
          <div className="text-3xl font-mono bg-blue-900 text-white p-4 rounded-md break-all">
            {process.env.CLIENT_FLAG}
          </div>
        </div>

        <ServerFlagButton />
      </div>
    </div>
  );
}
