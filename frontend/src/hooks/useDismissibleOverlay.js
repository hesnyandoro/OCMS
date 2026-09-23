import { useEffect } from 'react';

/**
 * Close an overlay on Escape or backdrop click (click outside the panel).
 */
export const useDismissibleOverlay = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen || typeof onClose !== 'function') return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const onBackdropClick = (event) => {
    if (event.target === event.currentTarget && typeof onClose === 'function') {
      onClose();
    }
  };

  return { onBackdropClick };
};
