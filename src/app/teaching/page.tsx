"use client";

import { useEffect, useState } from "react";

interface Course {
  id: number;
  title: string;
  code: string;
  description: string;
  semester: string | null;
  materials: string | null;
  created_at: string;
}

export default function TeachingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Teaching</h1>
        <p className="text-lg text-slate-600">
          Browse courses, lecture materials, syllabi, and exam preparation resources.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No courses yet.</p>
          <p className="text-slate-400 mt-2">Courses will appear here once added by the administrator.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => {
            let materials: { name: string; url: string }[] = [];
            try {
              materials = course.materials ? JSON.parse(course.materials) : [];
            } catch {
              materials = [];
            }

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-slate-100"
              >
                <div className="flex flex-wrap items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-mono text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      {course.code}
                    </span>
                    {course.semester && (
                      <span className="ml-2 text-sm text-slate-400">{course.semester}</span>
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{course.title}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{course.description}</p>

                {materials.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Course Materials</h4>
                    <ul className="space-y-1">
                      {materials.map((mat, i) => (
                        <li key={i}>
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:text-amber-700 text-sm"
                          >
                            📎 {mat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
