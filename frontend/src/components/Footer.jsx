import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link to="/" className="text-xl font-extrabold text-brand">
            sessions
          </Link>
          <p className="max-w-xl text-sm text-gray-500">
            Connect with expert creators and book live experiences across 
            fitness, mentoring, workshops, cooking, and countless other passions.
          </p>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Sessions</p>
          <p>Built with ❤️ by a future Ahoum intern</p>
        </div>
      </div>
    </footer>
  );
}
