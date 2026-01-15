
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dataService } from '../services/dataService';
import { Member } from '../types';

const StatCard = ({ title, value, change, color }: { title: string, value: string, change?: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-2">
    <span className="text-gray-500 text-sm font-medium">{title}</span>
    <div className="flex items-end justify-between">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {change && <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">{change}</span>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    members: dataService.getMembers().length,
    visitors: dataService.getAttendance().filter(a => a.is_visitor).length,
    tithe: dataService.getFinances()
      .filter(f => f.category === 'Tithe' && f.currency === 'LRD')
      .reduce((sum, f) => sum + f.amount, 0),
    avgAttendance: dataService.getAttendance().length
  });

  const [recentMembers, setRecentMembers] = useState<Member[]>(dataService.getMembers().slice(-5).reverse());

  useEffect(() => {
    return dataService.subscribe(() => {
      setStats({
        members: dataService.getMembers().length,
        visitors: dataService.getAttendance().filter(a => a.is_visitor).length,
        tithe: dataService.getFinances()
          .filter(f => f.category === 'Tithe' && f.currency === 'LRD')
          .reduce((sum, f) => sum + f.amount, 0),
        avgAttendance: dataService.getAttendance().length
      });
      setRecentMembers(dataService.getMembers().slice(-5).reverse());
    });
  }, []);

  const chartData = [
    { name: 'Prev', members: 45, visitors: 12 },
    { name: 'Last', members: 52, visitors: 8 },
    { name: 'Today', members: dataService.getAttendance().filter(a => !a.is_visitor).length, visitors: stats.visitors },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Champions' Dashboard 🇱🇷</h1>
        <p className="text-gray-500 font-medium">Welcome to LFCA management. Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value={stats.members.toString()} change="+12" color="text-blue-900" />
        <StatCard title="Visitors Today" value={stats.visitors.toString()} change="+5" color="text-red-600" />
        <StatCard title="Total Tithe (LRD)" value={stats.tithe.toLocaleString()} change="+18%" color="text-green-600" />
        <StatCard title="Today Presence" value={dataService.getAttendance().length.toString()} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Attendance Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="members" fill="#1e40af" radius={[4, 4, 0, 0]} name="Members" />
                <Bar dataKey="visitors" fill="#dc2626" radius={[4, 4, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-lg font-bold mb-6">Recent Members</h3>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-blue-50">
                    <img 
                      src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=1e40af&color=fff`} 
                      className="w-full h-full object-cover" 
                      alt={member.full_name} 
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{member.full_name}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{member.department}</p>
                  </div>
                </div>
                <Link to="/members" className="text-blue-800 text-xs font-bold">View Profile</Link>
              </div>
            ))}
            {recentMembers.length === 0 && (
              <p className="text-center py-10 text-gray-400 italic">No members added recently.</p>
            )}
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/members" className="flex flex-col items-center justify-center p-6 bg-blue-800 text-white rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-900 active:scale-95 transition-all">
                <span className="text-2xl mb-2">👥</span>
                <span className="font-bold text-sm">Directory</span>
            </Link>
            <Link to="/finance" className="flex flex-col items-center justify-center p-6 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all">
                <span className="text-2xl mb-2">💸</span>
                <span className="font-bold text-sm">Finance</span>
            </Link>
            <Link to="/attendance" className="flex flex-col items-center justify-center p-6 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all">
                <span className="text-2xl mb-2">📍</span>
                <span className="font-bold text-sm">Attendance</span>
            </Link>
            <Link to="/ai" className="flex flex-col items-center justify-center p-6 bg-yellow-500 text-white rounded-2xl shadow-lg shadow-yellow-100 hover:bg-yellow-600 active:scale-95 transition-all">
                <span className="text-2xl mb-2">📢</span>
                <span className="font-bold text-sm">AI Helper</span>
            </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
