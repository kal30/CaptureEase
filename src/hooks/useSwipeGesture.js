import { useRef, useEffect } from 'react';

/**
 * useSwipeGesture - Custom hook for detecting left/right swipe gestures
 * Clean, reusable swipe detection logic
 * 
 * @param {Object} options
 * @param {function} options.onSwipeLeft - Handler for left swipe  
 * @param {function} options.onSwipeRight - Handler for right swipe
 * @param {number} options.minSwipeDistance - Minimum distance for swipe (default: 50)
 * @param {number} options.maxSwipeTime - Maximum time for swipe (default: 300ms)
 * @returns {React.RefObject} - Ref to attach to swipeable element
 */
export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
  maxSwipeTime = 300
}) => {
  const elementRef = useRef(null);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const touchStartTime = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      touchEnd.current = null;
      touchStart.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
    };

    const handleTouchMove = (e) => {
      touchEnd.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!touchStart.current || !touchEnd.current) return;
      
      const distance = touchStart.current - touchEnd.current;
      const swipeTime = Date.now() - touchStartTime.current;
      
      // Check if swipe meets criteria
      if (Math.abs(distance) < minSwipeDistance) return;
      if (swipeTime > maxSwipeTime) return;
      
      // Determine swipe direction
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance, maxSwipeTime]);

  return elementRef;
};