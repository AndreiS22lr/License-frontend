import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-red-600 text-white p-4 flex items-center justify-between">
      <div className="font-bold text-xl">ψαλτήρι</div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>

        <Link to="/lessons" className="hover:underline">
          Lectii
        </Link>

        <Link to="/exercises" className="hover:underline">
          Exercitii
        </Link>

        <Link to="/songs" className="hover:underline">
          Cantari
        </Link>

        <Link to="/mysongs" className="hover:underline">
          Cantarile mele
        </Link>

        <Link to="/login" className="hover:underline">
          Login
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;
