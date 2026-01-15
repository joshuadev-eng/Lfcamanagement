
import React, { useState, useEffect } from 'react';
import { ServiceType, AttendanceRecord } from '../types';
import { dataService } from '../services/dataService';

const AttendanceManager: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(dataService.getAttendance());
  const [isMarking, setIsMarking] = useState(false);
  const [activeService, setActiveService] = useState(ServiceType.SUNDAY);
  const [showVisitorForm, setShowVisitorForm] = useState(false);

  const [visitorData, setVisitorData] = useState({
    visitor_name: '',
    visitor_phone: '',
    notes: ''
  });

  useEffect(() => {
    return dataService.subscribe(() => {
      setRecords(dataService.getAttendance());
    });
  }, []);

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.addAttendance({
      service_date: new Date().toISOString(),
      service_name: activeService,
      is_visitor: true,
      ...visitorData
    });
    setShowVisitorForm(false);
    setVisitorData({ visitor_name: '', visitor_phone: '', notes: '' });
  };

  const serviceRecords = records.filter(r => r.service_name === activeService);
  const visitorCount = serviceRecords.filter(r => r.is_visitor).length;
  const memberCount = serviceRecords.filter(r => !r.is_visitor).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Attendance Tracking</h1>
        <div className="flex space-x-2">
            <button 
                onClick={() => setShowVisitorForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition-colors"
            >
                + New Visitor
            </button>
            <button 
                onClick={() => setIsMarking(!isMarking)}
                className="bg-blue-800 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-900 transition-colors"
            >
                {isMarking ? 'Stop Marking' : 'Start Marking'}
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4">Currently Marking: {activeService}</h3>
                <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
                    {Object.values(ServiceType).map(s => (
                        <button 
                            key={s} 
                            onClick={() => setActiveService(s)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeService === s ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {isMarking ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                        <div className="w-32 h-32 bg-white rounded-2xl shadow-lg mb-6 flex items-center justify-center text-4xl animate-pulse">
                            📷
                        </div>
                        <p className="text-gray-500 text-center mb-6 font-medium">Camera ready for QR scanning.<br/>Point camera at member's ID card.</p>
                        <button 
                          className="bg-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-blue-900 active:scale-95 transition-all"
                          onClick={() => {
                            // Mock scan success
                            dataService.addAttendance({
                                service_date: new Date().toISOString(),
                                service_name: activeService,
                                is_visitor: false,
                                visitor_name: 'Member #' + Math.floor(Math.random() * 100)
                            });
                          }}
                        >
                          Simulate Scan
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl">
                        <div className="p-4 border-b">
                            <h4 className="font-bold text-gray-700">Recent Logs ({activeService})</h4>
                        </div>
                        <ul className="divide-y">
                            {serviceRecords.slice(0, 10).map(rec => (
                                <li key={rec.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${rec.is_visitor ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        <span className="font-medium">{rec.visitor_name}</span>
                                        {rec.is_visitor && <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded font-black uppercase">Visitor</span>}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xs text-gray-400">{new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <button 
                                          onClick={() => dataService.deleteAttendance(rec.id)}
                                          className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                          </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {serviceRecords.length === 0 && (
                                <p className="p-12 text-gray-400 italic text-center">No logs recorded for this service session.</p>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4">Service Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                        <span className="text-blue-800 font-bold">Members</span>
                        <span className="text-2xl font-black">{memberCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                        <span className="text-red-800 font-bold">Visitors</span>
                        <span className="text-2xl font-black">{visitorCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-xl shadow-lg">
                        <span className="font-bold uppercase tracking-wider text-xs opacity-80">Total Present</span>
                        <span className="text-3xl font-black">{serviceRecords.length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                <h4 className="font-bold text-yellow-800 mb-2">Notice</h4>
                <p className="text-yellow-700 text-sm leading-relaxed">Attendance syncing is active. Reports are automatically generated for leadership review.</p>
            </div>
        </div>
      </div>

      {showVisitorForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-4">Register New Visitor</h3>
                <form className="space-y-4" onSubmit={handleVisitorSubmit}>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Visitor Name</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border rounded-xl" 
                          required 
                          placeholder="Full Name" 
                          value={visitorData.visitor_name}
                          onChange={e => setVisitorData({...visitorData, visitor_name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border rounded-xl" 
                          required 
                          placeholder="+231 ..."
                          value={visitorData.visitor_phone}
                          onChange={e => setVisitorData({...visitorData, visitor_phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Notes / Invited By</label>
                        <textarea 
                          className="w-full p-3 border rounded-xl" 
                          rows={3} 
                          placeholder="e.g. Invited by Bro. Abraham"
                          value={visitorData.notes}
                          onChange={e => setVisitorData({...visitorData, notes: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowVisitorForm(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600">Cancel</button>
                        <button type="submit" className="flex-1 bg-red-600 py-3 rounded-xl font-bold text-white shadow-lg shadow-red-200">Check In Visitor</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
