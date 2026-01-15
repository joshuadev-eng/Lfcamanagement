
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <p className="text-gray-500">Manage church settings, user roles, and integrations.</p>
      </header>

      <div className="space-y-6">
        {/* Church Profile */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Church Profile</h3>
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-800 overflow-hidden shadow-lg">
                      <img 
                          src="https://i.ibb.co/LzN230M/lfca-logo.png" 
                          alt="LFCA Logo" 
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=LFCA&background=1e40af&color=fff'; }}
                      />
                    </div>
                    <button className="text-blue-600 font-bold text-sm">Update Logo</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Church Name</label>
                        <input type="text" className="w-full p-2 border rounded-lg" defaultValue="Living Faith Champions' Assembly" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Location</label>
                        <input type="text" className="w-full p-2 border rounded-lg" defaultValue="Monrovia, Liberia" />
                    </div>
                </div>
            </div>
        </section>

        {/* Messaging Integration */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Messaging & Alerts</h3>
            <p className="text-sm text-gray-500 mb-4">Configure Twilio or WhatsApp Cloud API for notifications.</p>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">💬</span>
                        <div>
                            <p className="font-bold">WhatsApp Integration</p>
                            <p className="text-xs text-gray-400">Send service reminders</p>
                        </div>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Connected</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">📱</span>
                        <div>
                            <p className="font-bold">SMS (Orange/Lonestar)</p>
                            <p className="text-xs text-gray-400">Bulk member messaging</p>
                        </div>
                    </div>
                    <button className="text-blue-600 font-bold text-sm">Configure</button>
                </div>
            </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
            <h3 className="font-bold text-red-800 mb-4">Danger Zone</h3>
            <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg text-red-700 hover:bg-red-100 font-medium">Reset All Real-time Subscriptions</button>
                <button className="w-full text-left p-3 rounded-lg text-red-700 hover:bg-red-100 font-medium">Wipe Attendance Data (Current Month)</button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
