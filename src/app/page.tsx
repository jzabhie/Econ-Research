import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Economics Research Portal
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Exploring economic theory, sharing research, and fostering academic collaboration
              through teaching and interactive learning.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/research"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Research
              </Link>
              <Link
                href="/teaching"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-white/20"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">
            What You&apos;ll Find Here
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Research Card */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-slate-100">
              <div className="text-amber-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Research</h3>
              <p className="text-slate-600 mb-4">
                Access ongoing research papers, working code, datasets, and publications.
                Stay updated with the latest findings and methodologies.
              </p>
              <Link href="/research" className="text-amber-600 hover:text-amber-700 font-semibold">
                Explore Research →
              </Link>
            </div>

            {/* Teaching Card */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-slate-100">
              <div className="text-amber-600 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Teaching</h3>
              <p className="text-slate-600 mb-4">
                Browse course materials, lecture notes, syllabi, and exam questions.
                Everything you need for your economics courses.
              </p>
              <Link href="/teaching" className="text-amber-600 hover:text-amber-700 font-semibold">
                View Courses →
              </Link>
            </div>

            {/* Notebook Card */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-slate-100">
              <div className="text-amber-600 text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Notebook</h3>
              <p className="text-slate-600 mb-4">
                Interactive exam notebook where students can write and submit answers.
                Time-limited access ensures fair assessment.
              </p>
              <Link href="/notebook" className="text-amber-600 hover:text-amber-700 font-semibold">
                Open Notebook →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-slate-800">About This Portal</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            This platform serves as a central hub for academic activities — from sharing
            cutting-edge economics research and working code to providing course materials
            and conducting interactive exams. Students can log in to access time-limited
            assessments and submit their work directly through the notebook interface.
          </p>
        </div>
      </section>
    </div>
  );
}
