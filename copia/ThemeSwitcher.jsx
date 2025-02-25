import React from 'react';

const ThemeSwitcher = () => {
  const themes = {
    blue: {
      primary: 'blue',
      secondary: 'gray',
      accent: 'indigo'
    },
    emerald: {
      primary: 'emerald',
      secondary: 'slate',
      accent: 'teal'
    },
    rose: {
      primary: 'rose',
      secondary: 'slate',
      accent: 'pink'
    }
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    // Store theme preference
    localStorage.setItem('selectedTheme', themeName);
    
    // Update root element with theme classes
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
  };

  return (
    <div className="flex gap-2 p-4">
      <button 
        onClick={() => applyTheme('blue')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Blue Theme
      </button>
      <button 
        onClick={() => applyTheme('emerald')}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
      >
        Emerald Theme
      </button>
      <button 
        onClick={() => applyTheme('rose')}
        className="px-4 py-2 bg-rose-600 text-white rounded-lg"
      >
        Rose Theme
      </button>
    </div>
  );
};

export default ThemeSwitcher;