// Here contains the logic for the Checkout screen, which handles the checkout process, including collecting shipping details, processing the order, and interacting with the backend API to place the order.

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/useWishlist';
import { useUser } from '../context/UserContext';
import './style/CheckoutScreen.css';

// Helper to inject Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutScreen = () => {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { refreshWishlist } = useWishlist();
    const { userInfo } = useUser();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'Razorpay'

    const [address, setAddress] = useState({
        fullName: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const totalCalculated = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    const handleRazorpayPayment = async (createdMongoOrder) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Failed to load Razorpay checkout gateway. Are you connected to the internet?');
      return;
    }

    try {
      // 1. Get Razorpay Order ID from your backend
      const res = await fetch('http://localhost:5000/api/orders/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ amount: totalCalculated }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error generating Razorpay Order');
        return;
      }

      // 2. Open Razorpay Checkout modal with pre-configured UPI tab
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Anime Loot Store',
        description: 'Order Payment',
        order_id: data.orderId,
        prefill: {
          name: address.fullName || userInfo.name,
          email: userInfo.email,
        },
        theme: {
          color: '#ff4757',
        },
        handler: async function (response) {
          // 3. Send signature to backend for cryptographic verification
          try {
            const verifyRes = await fetch('http://localhost:5000/api/orders/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: createdMongoOrder._id,
              }),
            });

            if (verifyRes.ok) {
              clearCart();
              refreshWishlist();
              alert('Payment Successful & Verified! Arigato! 🎉');
              navigate('/profile', { state: { defaultTab: 'orders' } });
            } else {
              alert('Payment verification failed on the server.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Error verifying payment.');
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      alert('Could not initialize payment gateway.');
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userInfo?.token) {
            alert('Please log in before placing an order.');
            navigate('/login');
            return;
        }

        // 1. Prepare order data including selected payment method
        const orderData = {
            orderItems: cartItems.map((item) => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            product: item._id,
            })),
            shippingAddress: address,
            totalPrice: totalCalculated,
            paymentMethod,
        };

        try {
            // 2. Create the base order in MongoDB first
            const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(orderData),
            });

            const savedOrder = await res.json();

            if (!res.ok) {
            alert(savedOrder.message || 'Oops! The Ninja system hit a snag. Please try again.');
            return;
            }

            // 3. Branch based on payment method
            if (paymentMethod === 'COD') {
            alert("Processing your Anime Loot... 💳");
            setTimeout(() => {
                clearCart();
                refreshWishlist();
                alert("Order Placed Successfully! Arigato! 🎉");
                navigate('/profile', { state: { defaultTab: 'orders' } });
            }, 1500);
            } else {
            // 4. Trigger Razorpay modal for UPI / Online
            await handleRazorpayPayment(savedOrder);
            }
        } catch (error) {
            console.error('Order Error:', error);
            alert('Connection lost to the Hidden Leaf Village. Check your server!');
        }
        };

    if (cartItems.length === 0) {
        return <div className="checkout-container"><h2>Your cart is empty!</h2></div>;
    }

    return (
        <div className="checkout-container">
        <div className="checkout-form-section">
            <h2>Shipping Details</h2>
            <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Full Name" 
                required 
                onChange={(e) => setAddress({...address, fullName: e.target.value})}
            />
            <input 
                type="text" 
                placeholder="Address Line 1" 
                required 
                onChange={(e) => setAddress({...address, city: e.target.value})}
            />
            <input 
                type="text" 
                placeholder="Postal Code" 
                required 
                onChange={(e) => setAddress({...address, postalCode: e.target.value})}
            />
            <input 
                type="text" 
                placeholder="Country" 
                required 
                onChange={(e) => setAddress({...address, country: e.target.value})}
            />
            
            <div className="payment-method">
            <h3>Payment Method</h3>
            <label style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />{' '}
              Cash on Delivery (Standard)
            </label>

            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payment"
                value="Razorpay"
                checked={paymentMethod === 'Razorpay'}
                onChange={() => setPaymentMethod('Razorpay')}
              />{' '}
              UPI / Online (Razorpay)
            </label>
          </div>

        <button type="submit" className="place-order-btn">
            {paymentMethod === 'COD' ? 'Place Order' : 'Pay with UPI / Online'}
          </button>
        </form>
      </div>

      <div className="order-summary-sidebar">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item._id} className="summary-item">
            <span>
              {item.qty}x {item.name}
            </span>
            <span>${(item.qty * item.price).toFixed(2)}</span>
          </div>
        ))}
        <hr />
        <div className="summary-total">
          <strong>Total: ${totalCalculated.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;