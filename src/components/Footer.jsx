import React from 'react';

const Footer = () => (
  <footer className="bg-dark text-light py-3 mt-4">
    <div className="container text-center">
      &copy; {new Date().getFullYear()} Temple Management. All rights reserved.
    </div>
  </footer>
);

export default Footer;
