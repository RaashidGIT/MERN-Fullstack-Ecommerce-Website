// Here contains the logic for the toast notification component, which displays notifications to the user based on actions taken in the application.

import { useCart } from '../context/CartContext';
import './style/Toast.css';

const Toast = () => {
  const { notification } = useCart();

  if (!notification) return null;

  return (
    <div className="toast-container">
      {notification}
    </div>
  );
};

export default Toast;