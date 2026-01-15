
import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';

const Toast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    return dataService.subscribe(() => {
      const last = dataService.getLastDeleted();
      if (last) {
        setMessage(`Record deleted successfully.`);
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-4 border border-gray-700">
        <span className="text-sm font-medium">{message}</span>
        <button 
          onClick={() => {
            dataService.undo();
            setVisible(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors"
        >
          Undo
        </button>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
