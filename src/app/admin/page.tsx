"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AccessGrant {
  id: number;
  user_id: number;
  resource_type: string;
  resource_id: number | null;
  granted_at: string;
  expires_at: string | null;
  user_name: string;
  user_email: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("research");
  const [loading, setLoading] = useState(true);
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const router = useRouter();

  // Form states
  const [researchForm, setResearchForm] = useState({
    title: "", description: "", category: "paper", link: "",
  });
  const [courseForm, setCourseForm] = useState({
    title: "", code: "", description: "", semester: "",
  });
  const [examForm, setExamForm] = useState({
    title: "", description: "", questions: "", start_time: "", end_time: "", is_active: false,
  });
  const [accessForm, setAccessForm] = useState({
    user_id: "", resource_type: "exam", resource_id: "", expires_at: "",
  });
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchGrants = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/admin/access", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.grants) setGrants(data.grants);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setUser(data.user);
        setLoading(false);
        fetchGrants();
      })
      .catch(() => router.push("/login"));
  }, [router, fetchGrants]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const submitResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(researchForm),
      });
      if (res.ok) {
        showMessage("✅ Research added successfully");
        setResearchForm({ title: "", description: "", category: "paper", link: "" });
      } else {
        const data = await res.json();
        showMessage("❌ " + (data.error || "Failed to add research"));
      }
    } catch {
      showMessage("❌ Network error");
    }
  };

  const submitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        showMessage("✅ Course added successfully");
        setCourseForm({ title: "", code: "", description: "", semester: "" });
      } else {
        const data = await res.json();
        showMessage("❌ " + (data.error || "Failed to add course"));
      }
    } catch {
      showMessage("❌ Network error");
    }
  };

  const submitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    try {
      let questions;
      try {
        questions = JSON.parse(examForm.questions);
      } catch {
        showMessage("❌ Questions must be valid JSON");
        return;
      }
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...examForm, questions }),
      });
      if (res.ok) {
        showMessage("✅ Exam created successfully");
        setExamForm({ title: "", description: "", questions: "", start_time: "", end_time: "", is_active: false });
      } else {
        const data = await res.json();
        showMessage("❌ " + (data.error || "Failed to create exam"));
      }
    } catch {
      showMessage("❌ Network error");
    }
  };

  const submitAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: parseInt(accessForm.user_id),
          resource_type: accessForm.resource_type,
          resource_id: accessForm.resource_id ? parseInt(accessForm.resource_id) : null,
          expires_at: accessForm.expires_at || null,
        }),
      });
      if (res.ok) {
        showMessage("✅ Access granted successfully");
        setAccessForm({ user_id: "", resource_type: "exam", resource_id: "", expires_at: "" });
        fetchGrants();
      } else {
        const data = await res.json();
        showMessage("❌ " + (data.error || "Failed to grant access"));
      }
    } catch {
      showMessage("❌ Network error");
    }
  };

  const revokeAccess = async (grantId: number) => {
    const token = getToken();
    try {
      const res = await fetch("/api/admin/access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: grantId }),
      });
      if (res.ok) {
        showMessage("✅ Access revoked");
        fetchGrants();
      }
    } catch {
      showMessage("❌ Network error");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading admin panel...</div>;
  }

  if (!user) return null;

  const tabs = [
    { id: "research", label: "📊 Research" },
    { id: "courses", label: "📚 Courses" },
    { id: "exams", label: "📝 Exams" },
    { id: "access", label: "🔐 Access" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome, {user.name}. Manage your content and student access.</p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Research Tab */}
      {activeTab === "research" && (
        <div className="bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Add Research Item</h2>
          <form onSubmit={submitResearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={researchForm.title}
                onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={researchForm.description}
                onChange={(e) => setResearchForm({ ...researchForm, description: e.target.value })}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={researchForm.category}
                  onChange={(e) => setResearchForm({ ...researchForm, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                >
                  <option value="paper">Paper</option>
                  <option value="working_paper">Working Paper</option>
                  <option value="code">Code</option>
                  <option value="data">Data</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link (optional)</label>
                <input
                  type="url"
                  value={researchForm.link}
                  onChange={(e) => setResearchForm({ ...researchForm, link: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                />
              </div>
            </div>
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold">
              Add Research
            </button>
          </form>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Add Course</h2>
          <form onSubmit={submitCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  required
                  placeholder="ECON 101"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester (optional)</label>
                <input
                  type="text"
                  value={courseForm.semester}
                  onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                  placeholder="Spring 2026"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800 min-h-[100px]"
              />
            </div>
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold">
              Add Course
            </button>
          </form>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <div className="bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Create Exam</h2>
          <form onSubmit={submitExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
              <input
                type="text"
                value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Questions (JSON)</label>
              <textarea
                value={examForm.questions}
                onChange={(e) => setExamForm({ ...examForm, questions: e.target.value })}
                required
                placeholder='[{"id": 1, "text": "What is GDP?", "type": "essay"}, {"id": 2, "text": "Explain supply and demand.", "type": "essay"}]'
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800 min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                Format: [{`{"id": 1, "text": "Question?", "type": "essay"}`}]
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time (optional)</label>
                <input
                  type="datetime-local"
                  value={examForm.start_time}
                  onChange={(e) => setExamForm({ ...examForm, start_time: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time (optional)</label>
                <input
                  type="datetime-local"
                  value={examForm.end_time}
                  onChange={(e) => setExamForm({ ...examForm, end_time: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={examForm.is_active}
                onChange={(e) => setExamForm({ ...examForm, is_active: e.target.checked })}
                className="rounded border-slate-300"
              />
              Make exam active immediately
            </label>
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold">
              Create Exam
            </button>
          </form>
        </div>
      )}

      {/* Access Tab */}
      {activeTab === "access" && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Grant Student Access</h2>
            <form onSubmit={submitAccess} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
                  <input
                    type="number"
                    value={accessForm.user_id}
                    onChange={(e) => setAccessForm({ ...accessForm, user_id: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={accessForm.resource_type}
                    onChange={(e) => setAccessForm({ ...accessForm, resource_type: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                  >
                    <option value="exam">Exam</option>
                    <option value="course">Course</option>
                    <option value="notebook">Notebook</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resource ID (optional)</label>
                  <input
                    type="number"
                    value={accessForm.resource_id}
                    onChange={(e) => setAccessForm({ ...accessForm, resource_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    value={accessForm.expires_at}
                    onChange={(e) => setAccessForm({ ...accessForm, expires_at: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-slate-800"
                  />
                </div>
              </div>
              <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold">
                Grant Access
              </button>
            </form>
          </div>

          {/* Current Grants */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Current Access Grants</h2>
            {grants.length === 0 ? (
              <p className="text-slate-500">No active access grants.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-600">Student</th>
                      <th className="text-left py-2 text-slate-600">Type</th>
                      <th className="text-left py-2 text-slate-600">Resource ID</th>
                      <th className="text-left py-2 text-slate-600">Expires</th>
                      <th className="text-left py-2 text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grants.map((grant) => (
                      <tr key={grant.id} className="border-b border-slate-100">
                        <td className="py-2">
                          {grant.user_name} <span className="text-slate-400">({grant.user_email})</span>
                        </td>
                        <td className="py-2">{grant.resource_type}</td>
                        <td className="py-2">{grant.resource_id || "All"}</td>
                        <td className="py-2">
                          {grant.expires_at ? new Date(grant.expires_at).toLocaleString() : "Never"}
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => revokeAccess(grant.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Revoke
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
      )}
    </div>
  );
}
