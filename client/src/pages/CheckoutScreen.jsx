import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './style/CheckoutScreen.css';

const CheckoutScreen = () => {
    const { cartItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        fullName: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Show your charming starting message
    alert("Processing your Anime Loot... 💳");

    // 2. Prepare the data for MongoDB
    const orderData = {
        orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id
        })),
        shippingAddress: address,
        totalPrice: cartItems.reduce((acc, item) => acc + item.qty * item.price, 0),
    };

    try {
        // 3. Send the data to the Backend
        const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        });

        if (res.ok) {
        // 4. Wait for the "Simulation" delay so the user feels the "Processing"
        setTimeout(() => {
            clearCart();
            alert("Order Placed Successfully! Arigato! 🎉"); // Your success message
            navigate('/'); 
        }, 2000);
        } else {
        alert("Oops! The Ninja system hit a snag. Please try again.");
        }
    } catch (error) {
        console.error("Order Error:", error);
        alert("Connection lost to the Hidden Leaf Village. Check your server!");
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
                placeholder="City" 
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
                <label>
                <input type="radio" name="payment" checked readOnly /> Cash on Delivery (Standard)
                </label>
            </div>

            <button type="submit" className="place-order-btn">Place Order</button>
            </form>
        </div>

        <div className="order-summary-sidebar">
            <h3>Order Summary</h3>
            {cartItems.map(item => (
            <div key={item._id} className="summary-item">
                <span>{item.qty}x {item.name}</span>
                <span>${(item.qty * item.price).toFixed(2)}</span>
            </div>
            ))}
            <hr />
            <div className="summary-total">
            <strong>Total: ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</strong>
            </div>
        </div>
        </div>
    );
};

export default CheckoutScreen;