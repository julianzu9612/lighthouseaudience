import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function App() {
  const [status, setStatus] = useState('Testing Step 1: Header with Framer Motion');

  return (
    <div className="min-h-screen bg-pitch-black text-white">
      {/* Header */}
      <header className="border-b border-slate/30 bg-gradient-to-r from-charcoal to-pitch-black">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <svg className="w-8 h-8 text-fire-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-fire-red to-crimson bg-clip-text text-transparent">
                Video Analytics Dashboard
              </h1>
            </motion.div>

            <div className="text-dim-gray">
              Step 1 ✓
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold text-fire-red mb-4">{status}</h2>
          <div className="space-y-2 text-dim-gray">
            <p>✓ React working</p>
            <p>✓ Framer Motion working</p>
            <p>✓ Tailwind CSS working</p>
            <p>✓ Custom colors (fire-red, charcoal, etc.) working</p>
            <p>✓ Glass-panel style working</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
