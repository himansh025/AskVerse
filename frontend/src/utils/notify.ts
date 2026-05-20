import axios from 'axios';
import Swal from 'sweetalert2';

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
});

export const showSuccessToast = (message: string) => {
  void toast.fire({
    icon: 'success',
    title: message,
  });
};

export const showErrorToast = (message: string) => {
  void toast.fire({
    icon: 'error',
    title: message,
  });
};

export const getApiSuccessMessage = (payload: any, fallback = 'Success') => {
  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
};

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error;
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
