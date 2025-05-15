import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            Cocktail App
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link to="/cocktails" className="hover:text-blue-200">
              Cocktails
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
