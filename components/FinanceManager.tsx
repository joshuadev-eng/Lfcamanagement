
import React, { useState, useEffect } from 'react';
import { FinanceCategory, FinanceRecord } from '../types';
import { dataService } from '../services/dataService';

const FinanceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'reports'>('income');
  const [records, setRecords] = useState<FinanceRecord[]>(dataService.getFinances());
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    category: FinanceCategory.OFFERING,
    amount: '',
    currency: 'LRD' as 'LRD' | 'USD',
    donor_name: '',
    description: ''
  });

  useEffect(() => {
    return dataService.subscribe(() => {
      setRecords(dataService.getFinances());
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.addFinance({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setShowModal(false);
    setFormData({ category: FinanceCategory.OFFERING, amount: '', currency: 'LRD', donor_name: '', description: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance & Accounts</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors"
        >
          + Record Income
        </button>
      </header>

      <div className="flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('income')}
          className={`pb-2 px-4 font-semibold transition-all ${activeTab === 'income' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
        >
          Ledger
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`pb-2 px-4 font-semibold transition-all ${activeTab === 'reports' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
        >
          Reports
        </button>
      </div>

      {activeTab === 'income' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Donor/Source</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 text-gray-600">{new Date(record.recorded_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{record.donor_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        record.category === FinanceCategory.TITHE ? 'bg-blue-100 text-blue-800' : 
                        record.category === FinanceCategory.OFFERING ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {record.currency} {record.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => dataService.deleteFinance(record.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No financial records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4">Export Reports</h3>
                <div className="space-y-3">
                    <button className="w-full p-4 border rounded-xl hover:bg-gray-50 flex items-center justify-between">
                        <span className="font-medium">Monthly Financial Summary</span>
                        <span className="text-blue-600 text-sm font-bold">PDF</span>
                    </button>
                    <button className="w-full p-4 border rounded-xl hover:bg-gray-50 flex items-center justify-between">
                        <span className="font-medium">Annual Tithe Report</span>
                        <span className="text-blue-600 text-sm font-bold">CSV</span>
                    </button>
                </div>
            </div>
            <div className="bg-blue-800 p-6 rounded-2xl shadow-lg text-white">
                <h3 className="font-bold mb-2">AI Audit Assistance</h3>
                <p className="text-blue-100 text-sm mb-4">Analyze your church finances and get automated insights on growth and transparency.</p>
                <button className="bg-white text-blue-800 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors">Analyze Now</button>
            </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-4">Record Financial Income</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-semibold mb-1">Currency</label>
                          <select 
                            className="w-full p-2 border rounded-lg"
                            value={formData.currency}
                            onChange={e => setFormData({...formData, currency: e.target.value as 'LRD' | 'USD'})}
                          >
                              <option value="LRD">LRD</option>
                              <option value="USD">USD</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-semibold mb-1">Amount</label>
                          <input 
                            type="number" 
                            className="w-full p-2 border rounded-lg" 
                            required 
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                          />
                      </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Category</label>
                        <select 
                          className="w-full p-2 border rounded-lg"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value as FinanceCategory})}
                        >
                            {Object.values(FinanceCategory).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Donor / Source Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-lg" 
                          required 
                          placeholder="e.g. Abraham Benson"
                          value={formData.donor_name}
                          onChange={e => setFormData({...formData, donor_name: e.target.value})}
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600">Cancel</button>
                        <button type="submit" className="flex-1 bg-green-600 py-3 rounded-xl font-bold text-white shadow-lg shadow-green-200">Save Record</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManager;
