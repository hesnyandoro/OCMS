import { useEffect, useRef } from 'react';

/** Resumes and refreshes immediately when tab becomes active again 
  @param {Function} fetchFunction 
 @param {number} interval 
  @param {Array} dependencies
 */
export const useSmartRefresh = (fetchFunction, interval = 120000, dependencies = []) => {
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    // Function to start the refresh interval
    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current && !document.hidden) {
          fetchFunction();
        }
      }, interval);
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became inactive - pause refresh
        isActiveRef.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        // Tab became active - resume refresh and fetch immediately
        isActiveRef.current = true;
        fetchFunction();
        startInterval();
      }
    };

    startInterval();

    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchFunction, interval, dependencies]);
};
