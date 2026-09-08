import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* Mobile overlay */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <div className="mt-auto pt-4">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
