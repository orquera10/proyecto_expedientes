import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

function Navbar() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark"
  );
  const menuRef = useRef(null);
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  useEffect(() => {
    function handleClick(event) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  }

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="flex items-center gap-4"
          aria-label="Ir a inicio"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl shadow-sm">
            <img
              src={logo}
              alt="Logo Expedientes"
              className="h-11 w-11 rounded-2xl object-cover"
            />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-ink">
              Expedientes
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
              Panel principal
            </p>
          </div>
        </button>

        <div className="ml-auto flex items-center gap-4">
          <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setAbierto((prev) => !prev)}
            className="flex items-center gap-4 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40 hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-spice/20 text-sm font-semibold text-spice">
              {(usuario?.nombre || "U").slice(0, 1)}
            </span>
            <span className="hidden text-left md:block">
              <span className="block text-xs text-ink/50">Usuario</span>
              <span className="block">
                {usuario?.nombre || usuario?.usuario || "Sin nombre"}
              </span>
            </span>
            <span className="text-xs text-ink/50">▾</span>
          </button>

          {abierto && (
            <div
              className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-ink/10 bg-white p-2 text-sm shadow-haze"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink/80 transition hover:bg-ink/5">
                <span>Tema</span>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  aria-pressed={darkMode}
                  className={`relative flex h-8 w-16 items-center rounded-full border transition ${
                    darkMode
                      ? "border-moss bg-moss/20"
                      : "border-ink/15 bg-ink/5"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] shadow transition-transform ${
                      darkMode ? "translate-x-8" : "translate-x-0"
                    }`}
                  >
                    {darkMode ? "🌙" : "☀️"}
                  </span>
                  <span className="sr-only">Cambiar tema</span>
                </button>
              </div>
              <Link
                to="/perfil"
                className="block w-full rounded-xl px-3 py-2 text-left font-medium text-ink/80 transition hover:bg-ink/5"
                onClick={() => setAbierto(false)}
              >
                Perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                Cerrar sesion
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
