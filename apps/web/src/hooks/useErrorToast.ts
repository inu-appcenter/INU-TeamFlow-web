import { useState } from 'react';

export function useErrorToast(duration = 1800, initialMessage = '') {
  const [errorMessage, setErrorMessage] = useState(initialMessage);

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, duration);
  };

  return { errorMessage, showErrorMessage, setErrorMessage };
}
