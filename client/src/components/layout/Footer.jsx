import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-sm text-center text-gray-600">
      <p>
        &copy; 2026 All Rights Reserved |{' '}
        <a 
          href="https://www.genstreetech.com/" 
          target="_blank" 
          rel="noreferrer" 
          className="text-teal-600 hover:text-purple-600 font-semibold transition-colors"
        >
          Genstree AI LLP.
        </a>
      </p>
    </footer>
  );
};

export default Footer;
