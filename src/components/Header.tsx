
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              <path d="M5 3a2 2 0 0 0-2 2"></path>
              <path d="M19 3a2 2 0 0 1 2 2"></path>
              <path d="M21 19a2 2 0 0 1-2 2"></path>
              <path d="M5 21a2 2 0 0 1-2-2"></path>
              <path d="M9 3h1"></path>
              <path d="M9 21h1"></path>
              <path d="M14 3h1"></path>
              <path d="M14 21h1"></path>
              <path d="M3 9v1"></path>
              <path d="M21 9v1"></path>
              <path d="M3 14v1"></path>
              <path d="M21 14v1"></path>
              <rect x="7" y="7" width="10" height="10" rx="2"></rect>
            </svg>
          </div>
          <h1 className="text-xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-800 group-hover:translate-x-0.5 transition-transform duration-300">
            CourseTrack
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            Dashboard
          </Link>
          <div className="text-xs text-gray-500 border-l border-gray-200 pl-4 ml-2 space-y-1">
            <p>Created & Maintained by <span className="font-medium text-indigo-600"><a 
                href="https://www.linkedin.com/in/chetan71/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                Chetan Chauhan
              </a></span></p>
            <div className="flex space-x-2">
              
        
            </div>
          </div>
        </nav>
        
        <div className="md:hidden">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
