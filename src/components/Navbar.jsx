import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 text-white p-4 flex items-center justify-between">
      <div className="font-bold text-xl">🚀 MyApp Title</div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>

        <Link to="/2" className="hover:underline">
          Pagina2
        </Link>

        <Link to="/3" className="hover:underline">
          Pagina3
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
