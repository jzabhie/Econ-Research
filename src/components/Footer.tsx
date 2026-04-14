export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-2">Econ Research</h3>
            <p className="text-sm">
              Personal academic website for research, teaching, and student collaboration.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Quick Links</h3>
            <ul className="text-sm space-y-1">
              <li><a href="/research" className="hover:text-white transition-colors">Research</a></li>
              <li><a href="/teaching" className="hover:text-white transition-colors">Teaching</a></li>
              <li><a href="/notebook" className="hover:text-white transition-colors">Notebook</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Contact</h3>
            <p className="text-sm">Feel free to reach out for collaboration or inquiries.</p>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-4 text-center text-sm">
          © {new Date().getFullYear()} Econ Research. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
