// src/App.jsx
import React from 'react';
import HeritageGrid from './components/HeritageGrid';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Heritage Sites</h1>
        </div>
      </header>
      <main>
        <HeritageGrid />
      </main>
    </div>
  );
}

export default App;