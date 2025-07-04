// src/components/Navbar.jsx

import React, { useContext, useState } from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import { AuthContext } from '../context/AuthContext'; 

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext); 
  const navigate = useNavigate(); 
  const [showDropdown, setShowDropdown] = useState(false); 

  
  const handleLogout = () => {
    logout(); 
     
    navigate('/login'); 
    setShowDropdown(false); 
  };

  
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  return (
    <nav className="bg-red-600 text-white p-4 flex items-center justify-between shadow-md">
      
      <div className="font-bold text-xl">
        <Link to="/" className="text-white hover:text-gray-200 transition-colors">
          ψαλτήρι
        </Link>
      </div>
      
      
      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:underline">
          Home
        </Link>

        <Link to="/lessons" className="hover:underline">
          Lecții
        </Link>

        

        <Link to="/mysongs" className="hover:underline">
          Cântările mele
        </Link>

        
        {isAuthenticated ? (
          <div className="relative"> 
            <button
              onClick={toggleDropdown}
              className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center 
                         text-lg font-bold text-white cursor-pointer hover:bg-red-800 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              title={user?.firstName || user?.email} 
            >
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?')}
            </button>

            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <span className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-700"
                >
                  Deconectează-te
                </button>
              </div>
            )}
          </div>
        ) : (
          
          <Link to="/login" className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg font-semibold transition-colors shadow-sm">
            Login
          </Link>
        )}

        
        {user?.role === 'admin' && (
          <Link to="/admin/lessons" className="hover:underline bg-red-800 px-3 py-1 rounded-lg font-semibold transition-colors shadow-sm">
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
