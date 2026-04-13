"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  name: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => setUser(null));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-amber-400 hover:text-amber-300">
              Econ Research
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/research" className="hover:text-amber-300 transition-colors">
                Research
              </Link>
              <Link href="/teaching" className="hover:text-amber-300 transition-colors">
                Teaching
              </Link>
              <Link href="/notebook" className="hover:text-amber-300 transition-colors">
                Notebook
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-slate-300">
                  {user.name} ({user.role})
                </span>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-slate-600 hover:bg-slate-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-amber-600 hover:bg-amber-700 px-4 py-1 rounded text-sm transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
