
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Member, AttendanceRecord, FinanceRecord } from '../types';
import { dataService } from '../services/dataService';

const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'finances'>('overview');

  useEffect(() => {
    const loadData = () => {
      const allMembers = dataService.getMembers();
      const found = allMembers.find(m => m.id === id);
      if (found) {
        setMember(found);
        setAttendance(dataService.getAttendance().filter(a => a.member_id === id));
        setFinances(dataService.getFinances().filter(f => f.member_id === id));
      } else {
        // If not found after loading finishes, we might want to handle it
        // but for now we just wait for the subscription to trigger
      }
    };

    loadData();
    return dataService.subscribe(loadData);
  }, [id]);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Loading Champion Profile...</p>
      </div>
    );
  }

  const totalContributionsLRD = finances
    .filter(f => f.currency === 'LRD')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalContributionsUSD = finances
    .filter(f => f.currency === 'USD')
    .reduce((sum, f) => sum + f.amount, 0);

  const avatarUrl = member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=1e40af&color=fff&size=256`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Hero */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-xl overflow-hidden bg-blue-50">
            <img src={avatarUrl} alt={member.full_name} className="w-full h-full object-cover" />
          </div>
          <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${member.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{member.full_name}</h1>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest self-center md:self-auto">
                {member.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-500 font-medium">Joined {new Date(member.join_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Attendance</p>
              <p className="text-xl font-black text-gray-900">{attendance.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Contributions</p>
              <p className="text-xl font-black text-gray-900">{finances.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 col-span-2 md:col-span-1">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Department</p>
              <p className="text-sm font-black text-blue-800">{member.department || 'None'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/members')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Directory</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-2xl w-full md:w-fit">
        {(['overview', 'attendance', 'finances'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-800 rounded-lg">📇</span>
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Phone</span>
                  <span className="font-bold text-gray-900">{member.phone_number}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Email</span>
                  <span className="font-bold text-gray-900">{member.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Member ID</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-[10px] font-mono font-bold text-gray-500 uppercase">{member.id.split('-')[0]}</code>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="p-2 bg-green-50 text-green-600 rounded-lg">📊</span>
                Activity Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-black uppercase text-blue-400 mb-2 tracking-widest">Total LRD</p>
                  <p className="text-2xl font-black text-blue-900 leading-none">
                    <span className="text-sm font-bold opacity-50 mr-1">LRD</span>
                    {totalContributionsLRD.toLocaleString()}
                  </p>
                </div>
                <div className="p-6 bg-green-50/50 rounded-3xl border border-green-100">
                  <p className="text-[10px] font-black uppercase text-green-400 mb-2 tracking-widest">Total USD</p>
                  <p className="text-2xl font-black text-green-900 leading-none">
                    <span className="text-sm font-bold opacity-50 mr-1">$</span>
                    {totalContributionsUSD.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100">
                <p className="text-[10px] font-black uppercase text-red-400 mb-2 tracking-widest">Services Attended</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-red-900">{attendance.length}</p>
                  <p className="text-xs font-bold text-red-700/60 pb-1 uppercase tracking-widest">Recorded</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">Attendance Log</h3>
              <p className="text-gray-400 text-sm font-medium">History of all services this member has checked into.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Service</th>
                    <th className="px-8 py-4">Check-in Time</th>
                    <th className="px-8 py-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendance.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4 text-sm font-bold text-gray-900">
                        {new Date(rec.service_date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                          {rec.service_name}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-500 italic">
                        {rec.notes || '-'}
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic font-medium">No attendance records found for this Champion.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">Financial contributions</h3>
              <p className="text-gray-400 text-sm font-medium">History of Tithes, Offerings, and other seeds.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4">Currency</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {finances.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4 text-sm font-bold text-gray-900">
                        {new Date(rec.recorded_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          rec.category === 'Tithe' ? 'bg-green-100 text-green-700' :
                          rec.category === 'Offering' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {rec.category}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                        {rec.currency}
                      </td>
                      <td className="px-8 py-4 text-right text-lg font-black text-gray-900">
                        {rec.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {finances.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic font-medium">No financial records found for this Champion.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;
