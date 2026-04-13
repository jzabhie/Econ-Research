"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Exam {
  id: number;
  course_id: number | null;
  title: string;
  description: string | null;
  questions?: string;
  start_time: string | null;
  end_time: string | null;
  is_active: number;
}

interface Question {
  id: number;
  text: string;
  type: string;
}

export default function NotebookPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetch("/api/exams", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setExams(data.exams || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Timer for exam end time
  useEffect(() => {
    if (!selectedExam?.end_time) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const end = new Date(selectedExam.end_time!).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining("Time is up!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedExam]);

  const openExam = (exam: Exam) => {
    setSelectedExam(exam);
    setMessage("");
    try {
      const parsed = exam.questions ? JSON.parse(exam.questions) : [];
      setQuestions(Array.isArray(parsed) ? parsed : []);
    } catch {
      setQuestions([]);
    }
    setAnswers({});
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedExam) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/exams/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exam_id: selectedExam.id,
          answers: JSON.stringify(answers),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + (data.message || "Submission successful!"));
      } else {
        setMessage("❌ " + (data.error || "Submission failed"));
      }
    } catch {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Student Notebook</h1>
          <p className="text-lg text-slate-600 mb-8">
            Please log in to access exams and submit your answers.
          </p>
          <Link
            href="/login"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (selectedExam) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => setSelectedExam(null)}
          className="mb-6 text-amber-600 hover:text-amber-700 font-medium"
        >
          ← Back to Exams
        </button>

        <div className="bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{selectedExam.title}</h1>
              {selectedExam.description && (
                <p className="text-slate-600 mt-2">{selectedExam.description}</p>
              )}
            </div>
            {timeRemaining && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">
                ⏰ {timeRemaining}
              </div>
            )}
          </div>

          {questions.length === 0 ? (
            <p className="text-slate-500">No questions available for this exam.</p>
          ) : (
            <div className="space-y-8">
              {questions.map((q, i) => (
                <div key={q.id || i} className="border-b border-slate-100 pb-6">
                  <label className="block text-lg font-medium text-slate-800 mb-3">
                    <span className="text-amber-600 mr-2">Q{i + 1}.</span>
                    {q.text}
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-lg p-4 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y min-h-[120px]"
                    placeholder="Write your answer here..."
                    value={answers[q.id || i] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id || i]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className="mt-6 p-4 rounded-lg bg-slate-50 text-slate-700">{message}</div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || timeRemaining === "Time is up!"}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Answers"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">📝 Student Notebook</h1>
        <p className="text-lg text-slate-600">
          Select an active exam to view questions and submit your answers.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading exams...</div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No active exams available.</p>
          <p className="text-slate-400 mt-2">Check back later for new exams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-slate-100 cursor-pointer"
              onClick={() => openExam(exam)}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    exam.is_active
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {exam.is_active ? "Active" : "Inactive"}
                </span>
                {exam.end_time && (
                  <span className="text-xs text-slate-400">
                    Due: {new Date(exam.end_time).toLocaleString()}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{exam.title}</h3>
              {exam.description && (
                <p className="text-slate-600 text-sm">{exam.description}</p>
              )}
              <div className="mt-4 text-amber-600 text-sm font-medium">
                Open Exam →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
