import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Avatar } from "./ui";

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isCreator = user?.role === "creator";

  const handleSwitch = async () => {
    const next = isCreator ? "user" : "creator";
    await switchRole(next);
    setMenuOpen(false);
    navigate(next === "creator" ? "/creator/dashboard" : "/dashboard");
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-2xl font-extrabold text-brand">
          sessions
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={handleSwitch}
                className="hidden text-sm font-medium text-gray-700 hover:text-gray-900 sm:block"
              >
                {isCreator ? "Switch to attendee" : "Switch to creator"}
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-gray-300 p-1.5 pl-3 hover:shadow"
                >
                  <span className="text-sm">☰</span>
                  <Avatar user={user} size={30} />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    {isCreator ? (
                      <MenuLink to="/creator/dashboard" onClick={() => setMenuOpen(false)}>
                        My sessions
                      </MenuLink>
                    ) : (
                      <MenuLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                        My bookings
                      </MenuLink>
                    )}
                    <MenuLink to="/profile" onClick={() => setMenuOpen(false)}>
                      Profile
                    </MenuLink>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function MenuLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}
