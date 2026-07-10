import { useState } from 'react';

export function useErrorToast(duration = 1800) {
  const [errorMessage, setErrorMessage] = useState('');

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, duration);
  };

  return { errorMessage, showErrorMessage };
}
