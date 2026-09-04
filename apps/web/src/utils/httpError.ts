import axios from 'axios';

export const getHttpStatus = (error: unknown) => {
  if (!axios.isAxiosError(error)) return undefined;

  return error.response?.status;
};
