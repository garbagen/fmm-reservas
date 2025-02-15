// src/components/AdminDashboard/Table/components/PullToRefresh.jsx
import React, { useState, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const THRESHOLD = 80; // Distance in pixels needed to trigger refresh

  const handleTouchStart = (e) => {
    // Only enable pull to refresh when at top of container
    if (containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!pulling) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, THRESHOLD));
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= THRESHOLD) {
      await onRefresh();
    }
    setPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute w-full flex justify-center items-center transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance - 50}px)`,
          opacity: pullDistance / THRESHOLD
        }}
      >
        <RefreshCcw
          className="w-6 h-6 text-gray-500"
          style={{
            transform: `rotate(${(pullDistance / THRESHOLD) * 360}deg)`
          }}
        />
      </div>

      {/* Content with padding for pull indicator */}
      <div style={{ marginTop: pulling ? `${pullDistance}px` : 0 }}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;