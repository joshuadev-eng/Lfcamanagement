
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'sermon' | 'announcement' | 'chat'>('chat');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResponse('');
    try {
      let res = '';
      if (mode === 'sermon') {
        res = await geminiService.generateSermonOutline(query);
      } else if (mode === 'announcement') {
        res = await geminiService.generateAnnouncement(query);
      } else {
        res = await geminiService.chatAssistant(query, "LFCA Church Management");
      }
      setResponse(res);
    } catch (err) {
      setResponse("Sorry, I encountered an error. Please ensure your API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold">LFCA AI Assistant 🤖</h1>
        <p className="text-gray-500">I'm here to help with sermon outlines, announcements, and reports.</p>
      </header>

      <div className="flex justify-center space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
        {(['chat', 'sermon', 'announcement'] as const).map(m => (
            <button 
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${mode === m ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                {m} Tool
            </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {!response && !loading && (
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
                <h3 className="font-bold text-gray-800">Ready to assist!</h3>
                <p className="text-gray-500 text-sm">Try asking: "Give me a sermon outline on 'The Power of Faith'"</p>
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
                <span className="ml-3 font-medium text-gray-500">Generating spiritual insights...</span>
            </div>
          )}

          {response && (
            <div className="prose prose-blue max-w-none animate-in fade-in duration-700">
                <div className="bg-blue-50 p-6 rounded-2xl text-gray-800 whitespace-pre-wrap leading-relaxed border border-blue-100">
                    {response}
                </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t border-gray-100 flex items-center space-x-3">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'sermon' ? "Enter sermon theme..." : "Ask the AI assistant..."}
            className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-blue-800 focus:outline-none bg-white"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-800 text-white p-4 rounded-xl shadow-lg hover:bg-blue-900 disabled:opacity-50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
