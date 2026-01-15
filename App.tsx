import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { UserRole, Member, FinanceRecord, AttendanceRecord, ServiceType, FinanceCategory } from './types';
import { ICONS } from './constants';
import Dashboard from './components/Dashboard';
import MemberManager from './components/MemberManager';
import MemberProfile from './components/MemberProfile';
import FinanceManager from './components/FinanceManager';
import AttendanceManager from './components/AttendanceManager';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Toast from './components/Toast';
import Auth from './components/Auth';
import { authService, UserSession } from './services/authService';

const Layout: React.FC<{ children: React.ReactNode, session: UserSession }> = ({ children, session }) => {
  const location = useLocation();

  const allNavItems = [
    { path: '/', label: 'Home', icon: ICONS.Dashboard, roles: [UserRole.SUPER_ADMIN, UserRole.PASTOR, UserRole.DEPT_HEAD, UserRole.FINANCE_OFFICER, UserRole.MEMBER] },
    { path: '/members', label: 'Members', icon: ICONS.Members, roles: [UserRole.SUPER_ADMIN, UserRole.PASTOR, UserRole.DEPT_HEAD] },
    { path: '/attendance', label: 'Attendance', icon: ICONS.Attendance, roles: [UserRole.SUPER_ADMIN, UserRole.PASTOR, UserRole.DEPT_HEAD] },
    { path: '/finance', label: 'Finance', icon: ICONS.Finance, roles: [UserRole.SUPER_ADMIN, UserRole.FINANCE_OFFICER] },
    { path: '/ai', label: 'AI Help', icon: ICONS.AI, roles: [UserRole.SUPER_ADMIN, UserRole.PASTOR, UserRole.DEPT_HEAD] },
    { path: '/settings', label: 'Setup', icon: ICONS.Settings, roles: [UserRole.SUPER_ADMIN] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(session.role));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-blue-800 overflow-hidden shadow-lg">
            <img 
                src="https://i.ibb.co/LzN230M/lfca-logo.png" 
                alt="LFCA Logo" 
                className="w-full h-full object-contain p-0.5"
                onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=LFCA&background=1e40af&color=fff'; }}
            />
          </div>
          <span className="font-bold text-gray-800 text-sm leading-tight">LFCA<br/>Manager</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/') ? 'bg-blue-50 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="px-3 py-2 bg-gray-50 rounded-xl mb-2">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Logged in as</p>
            <p className="text-sm font-bold text-gray-700 truncate">{session.name}</p>
          </div>
          <button onClick={() => authService.logout()} className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-bold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative pb-20 md:pb-0 overflow-auto h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center md:hidden">
            <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-blue-800 overflow-hidden">
                    <img 
                        src="https://i.ibb.co/LzN230M/lfca-logo.png" 
                        alt="LFCA Logo" 
                        className="w-full h-full object-contain p-0.5"
                        onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=LFCA&background=1e40af&color=fff'; }}
                    />
                 </div>
                 <span className="font-bold text-gray-800">LFCA Manager</span>
            </div>
            <button className="p-2 text-gray-500"><ICONS.Settings /></button>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
        <Toast />
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 ${
              location.pathname === item.path ? 'text-blue-800' : 'text-gray-400'
            }`}
          >
            <item.icon />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return authService.subscribe((s, isLoading) => {
      setSession(s);
      setLoading(isLoading);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-800 text-white">
        <div className="text-center animate-pulse">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-blue-900 shadow-xl">
             <img src="https://i.ibb.co/LzN230M/lfca-logo.png" alt="Loading" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-xl font-bold">Verifying Champions...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Layout session={session}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<MemberManager />} />
          <Route path="/members/:id" element={<MemberProfile />} />
          <Route path="/attendance" element={<AttendanceManager />} />
          <Route path="/finance" element={<FinanceManager />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;