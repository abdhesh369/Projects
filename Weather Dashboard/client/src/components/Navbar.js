// client/src/components/Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Weather Dashboard</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;