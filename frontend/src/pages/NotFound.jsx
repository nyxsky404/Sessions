import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto mt-20 max-w-md text-center">
      <h1 className="text-5xl font-extrabold">404</h1>
      <p className="mt-2 text-gray-500">This page doesn’t exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to home
      </Link>
    </div>
  );
}
