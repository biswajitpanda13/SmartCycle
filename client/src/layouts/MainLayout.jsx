import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bike, LayoutDashboard, MapPin, History, Users, LogOut, Menu, X, Sun, Moon, Trophy, User, AlertTriangle } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Admins always get dark mode
    if (user?.role === 'admin') {
      document.documentElement.classList.add('dark');
      return true;
    }
    const saved = localStorage.getItem('darkMode');
    const isDark = saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    return isDark;
  });

  const toggleDarkMode = () => {
    if (isAdmin) return; // admins are always dark
    setIsDarkMode(prev => {
      const newDark = !prev;
      localStorage.setItem('darkMode', newDark);
      if (newDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newDark;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard',   path: '/student/dashboard',   icon: LayoutDashboard },
    { name: 'Bicycles',   path: '/student/bicycles',    icon: Bike },
    { name: 'Stations',   path: '/student/stations',    icon: MapPin },
    { name: 'My Rides',   path: '/student/history',     icon: History },
    { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { name: 'Profile',    path: '/student/profile',     icon: User },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Bicycles', path: '/admin/bicycles', icon: Bike },
    { name: 'Manage Stations', path: '/admin/stations', icon: MapPin },
    { name: 'Issues & Repairs', path: '/admin/issues', icon: AlertTriangle },
    { name: 'All Rides', path: '/admin/rides', icon: History },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 border-r shadow-sm transition-colors duration-200 ${
        isAdmin
          ? 'bg-gray-900 border-gray-700/50'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        {/* Logo */}
        <div className={`h-16 flex items-center px-6 border-b ${
          isAdmin ? 'border-gray-700/50' : 'border-gray-200 dark:border-gray-700'
        }`}>
          {isAdmin ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center shadow-lg">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">SmartCycle</span>
                <span className="text-[10px] text-primary-400 font-semibold uppercase tracking-widest">Admin Console</span>
              </div>
            </div>
          ) : (
            <>
              <Bike className="w-8 h-8 text-primary-600 dark:text-primary-500 mr-2" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">SmartCycle</span>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isAdmin
                    ? isActive
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    : isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 mr-3 ${isAdmin && isActive ? 'text-primary-400' : ''}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t ${
          isAdmin ? 'border-gray-700/50' : 'border-gray-200 dark:border-gray-700'
        }`}>
          <div className={`mb-3 px-3 py-2.5 rounded-xl flex items-center gap-3 ${
            isAdmin ? 'bg-white/5' : 'bg-gray-50 dark:bg-gray-700/50'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              isAdmin ? 'bg-primary-600/30 text-primary-400' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
            }`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isAdmin ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{user?.name}</p>
              <p className={`text-xs truncate ${isAdmin ? 'text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {isAdmin ? 'Administrator' : user?.rollNumber}
              </p>
            </div>
            {!isAdmin && (
              <button onClick={toggleDarkMode} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-xl transition-colors ${
              isAdmin
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden flex flex-col w-full h-full absolute inset-0 z-50 pointer-events-none">
        <div className="pointer-events-auto h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 transition-colors duration-200">
           <div className="flex items-center">
            <Bike className="w-8 h-8 text-primary-600 dark:text-primary-500 mr-2" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">SmartCycle</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleDarkMode} className="p-2 text-gray-500 dark:text-gray-400">
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-800 dark:text-white">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="pointer-events-auto flex-1 bg-white dark:bg-gray-800 flex flex-col transition-colors duration-200">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t dark:border-gray-700">
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden mt-16 md:mt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
