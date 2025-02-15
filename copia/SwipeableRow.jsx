// src/components/AdminDashboard/Table/components/SwipeableRow.jsx
import React, { useState, useRef } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const SwipeableRow = ({ item, onEdit, onDelete, children }) => {
  const [startX, setStartX] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const rowRef = useRef(null);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Limit swipe to left and max of -200px
    const newOffset = Math.max(Math.min(diff, 0), -200);
    setCurrentOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    // If swiped more than 100px, snap to -200px, otherwise snap back to 0
    if (currentOffset < -100) {
      setCurrentOffset(-200);
    } else {
      setCurrentOffset(0);
    }
  };

  return (
    <div className="relative overflow-hidden touch-pan-y">
      {/* Actions revealed by swipe */}
      <div 
        className="absolute right-0 top-0 h-full flex items-center gap-2 px-4"
        style={{ transform: `translateX(200px)` }}
      >
        <button
          onClick={() => onEdit(item)}
          className="h-12 w-12 flex items-center justify-center bg-blue-500 text-white rounded-lg shadow-lg"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="h-12 w-12 flex items-center justify-center bg-red-500 text-white rounded-lg shadow-lg"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div
        ref={rowRef}
        className="bg-white touch-pan-y"
        style={{
          transform: `translateX(${currentOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableRow;