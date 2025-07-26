
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  type?: ToastType;
  text1: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
}

export function useToast() {
  const showToast = ({
    type = 'success',
    text1,
    text2,
    position = 'top',
    visibilityTime = 3000,
  }: ToastOptions) => {
    Toast.show({
      type,
      text1,
      text2,
      position,
      visibilityTime,
    });
  };

  const hideToast = () => {
    Toast.hide();
  };

  return { showToast, hideToast };
}
