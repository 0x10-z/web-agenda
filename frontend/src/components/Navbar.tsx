import React from "react";

interface NavbarProps {
  handleLogout: () => void;
}

export default function Navbar({ handleLogout }: NavbarProps) {
  return (
    <header className="text-gray-900 dark:text-white">
      <nav className="border-b dark:border-gray-900 border-gray-200 container mx-auto flex flex-wrap items-center justify-between p-5">
        <div className="flex items-center">
          <img
            src="/favicon/android-chrome-192x192.png"
            width={40}
            height={40}
            alt="Logo"
            className="h-10 mr-3"
          />
          <span className="font-bold text-xl tracking-tight">Agenda</span>
        </div>
        <div className="flex dark:text-black">
          <button
            onClick={handleLogout}
            className="btn  bg-red-500 hover:bg-red-700 text-white py-2 px-4 m-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>
  ); // <div>Using a variable 42</div>
}

// <Link href="/" locale="en">
//   <h2>English</h2>
// </Link>
// <Link href="/" locale="es">
//   <h2>Español</h2>
// </Link>
