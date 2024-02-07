import React, { useState, useEffect } from 'react';

const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event) => {
      if (event.which === targetKey) {
        if (event.which !== 82 && event.which !== 38) {
          event.preventDefault();
        }
        setKeyPressed(true);
      }
    };

    const upHandler = (event) => {
      if (event.which === targetKey) {
         if (event.which !== 82 && event.which !== 38) {
          event.preventDefault();
        }
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};

export default useKeyPress;
