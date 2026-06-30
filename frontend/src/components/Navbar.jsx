import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./Toast";
import { getErrorMessage } from "../lib/errors";
import { Avatar, Icon } from "./ui";

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isCreator = user?.role === "creator";

  const handleSwitch = async () => {
    const next = isCreator ? "user" : "creator";
    try {
      await switchRole(next);
      setMenuOpen(false);
      toast.success(
        next === "creator" ? "You're now in creator mode." : "You're now in attendee mode."
      );
      navigate(next === "creator" ? "/creator/dashboard" : "/dashboard");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to={isCreator ? "/creator/dashboard" : "/"}
          className="text-2xl font-extrabold text-brand"
        >
          sessions
          {isCreator && <span className="text-gray-900"> × creators</span>}
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
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
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400">
                      {isCreator ? "Creator" : "Attendee"}
                    </div>
                    {isCreator ? (
                      <MenuLink to="/creator/dashboard" icon="grid" onClick={() => setMenuOpen(false)}>
                        My sessions
                      </MenuLink>
                    ) : (
                      <MenuLink to="/dashboard" icon="ticket" onClick={() => setMenuOpen(false)}>
                        My bookings
                      </MenuLink>
                    )}
                    <MenuLink to="/profile" icon="user" onClick={() => setMenuOpen(false)}>
                      Profile
                    </MenuLink>
                    <hr className="my-1 border-gray-100" />
                    <MenuButton icon="switch" onClick={handleSwitch}>
                      {isCreator ? "Switch to attendee" : "Switch to creator"}
                    </MenuButton>
                    <MenuButton icon="logout" onClick={handleLogout}>
                      Log out
                    </MenuButton>
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

function MenuLink({ to, children, onClick, icon }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
    >
      {icon && <Icon name={icon} className="h-4 w-4 text-gray-400" />}
      {children}
    </Link>
  );
}

function MenuButton({ children, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
    >
      {icon && <Icon name={icon} className="h-4 w-4 text-gray-400" />}
      {children}
    </button>
  );
}
