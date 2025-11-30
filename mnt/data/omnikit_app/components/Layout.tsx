import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Box, Home, Info, Mail, ChevronDown, Type, Sparkles, QrCode, FileText, Lock, Moon, Sun, Palette } from 'lucide-react';
import { APP_NAME } from '../constants';
import { useToast } from '../components/Toast';
import { OmniLogo } from './UIComponents';

// --- Types & Data ---
interface NavConfig {
  path: string;
  label: string;
  icon: any;
}

const NAV_ITEMS: NavConfig[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/tools', label: 'Tools', icon: Box }, 
  { path: '/about', label: 'About Us', icon: Info },
  { path: '/contact', label: 'Contact Us', icon: Mail },
];

const NAV_SUB_TOOLS = [
  { id: 'text-converter', label: 'Text Converter', icon: Type, path: '/tools?tool=text-converter' },
  { id: 'markdown-preview', label: 'Markdown Preview', icon: FileText, path: '/tools?tool=markdown-preview' },
  { id: 'ai-summary', label: 'AI Summarizer', icon: Sparkles, path: '/tools?tool=ai-summary' },
  { id: 'qr-generator', label: 'QR Generator', icon: QrCode, path: '/tools?tool=qr-generator' },
  { id: 'password-generator', label: 'Password Generator', icon: Lock, path: '/tools?tool=password-generator' },
  { id: 'color-palette', label: 'Color Palette', icon: Palette, path: '/tools?tool=color-palette' },
];

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsAccordionOpen, setIsToolsAccordionOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Dark Mode Initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('omnikit-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle Dark Mode
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omnikit-theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omnikit-theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Reset accordion when menu is closed
  useEffect(() => {
    if (!isMenuOpen) {
      setIsToolsAccordionOpen(false);
    }
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node) &&
          menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
         setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl ring-4 ring-indigo-300 transition-all"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20 transition-all">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl p-1"
              aria-label={`${APP_NAME} Home`}
            >
              <OmniLogo className="w-10 h-10 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 group-hover:scale-105 transition-transform duration-300" />
              <span className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {APP_NAME}
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
              </button>

              {/* Menu Button */}
              <button
                ref={menuButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`
                   group p-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold border
                   ${isMenuOpen 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-750'}
                   focus:outline-none focus:ring-2 focus:ring-indigo-500
                `}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="main-navigation"
              >
                <span className="text-sm hidden sm:inline">Menu</span>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Drawer */}
        <div 
          id="main-navigation"
          ref={menuRef}
          className={`
            bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] absolute top-full left-0 w-full z-40 origin-top
            ${isMenuOpen ? 'max-h-[85vh] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95 invisible'}
          `}
        >
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-2 overflow-y-auto max-h-[80vh]">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2">Navigation</p>
            
            {NAV_ITEMS.map((item) => {
              if (item.label === 'Tools') {
                const isExpanded = isToolsAccordionOpen;
                const isToolsActive = location.pathname.startsWith('/tools'); 

                return (
                   <div key="nav-tools" className="space-y-1">
                      <button 
                        onClick={() => setIsToolsAccordionOpen(!isToolsAccordionOpen)}
                        className={`
                          w-full flex items-center justify-between p-4 rounded-xl font-bold text-lg transition-all border group
                          ${isToolsActive || isExpanded
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800' 
                            : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                        aria-expanded={isExpanded}
                      >
                        <span className="flex items-center gap-4">
                          <Box size={22} className={isToolsActive || isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors'} /> 
                          <span>Tools</span>
                        </span>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      </button>
                      
                      <div className={`
                         grid gap-1 transition-all duration-300 ease-in-out pl-4 ml-8 border-l-2 border-slate-100 dark:border-slate-800
                         ${isExpanded ? 'max-h-[600px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0 overflow-hidden hidden'}
                      `}>
                         {NAV_SUB_TOOLS.map(tool => (
                           <Link 
                             key={tool.id} 
                             to={tool.path}
                             onClick={() => setIsMenuOpen(false)}
                             className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 text-slate-500 dark:text-slate-400 font-medium group/tool"
                           >
                             <tool.icon size={18} className="text-slate-400 dark:text-slate-500 group-hover/tool:text-indigo-500 dark:group-hover/tool:text-indigo-400 group-hover/tool:scale-110 transition-all" /> 
                             <span>{tool.label}</span>
                           </Link>
                         ))}
                      </div>
                   </div>
                );
              }

              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl font-bold text-lg transition-all border group
                    ${isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                  `}
                >
                  <item.icon size={22} className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} /> 
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800">
             <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>© {new Date().getFullYear()} {APP_NAME}</span>
                <span>v1.3.0 (Dark Mode)</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow focus:outline-none relative z-0" tabIndex={-1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-2">
               <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-slate-900 dark:text-white text-lg">
                 <OmniLogo className="w-6 h-6" />
                 {APP_NAME}
               </div>
               <p className="text-slate-500 dark:text-slate-400 text-sm">Empowering your web experience with secure, client-side utilities.</p>
               <p className="text-slate-400 dark:text-slate-600 text-xs mt-4">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;