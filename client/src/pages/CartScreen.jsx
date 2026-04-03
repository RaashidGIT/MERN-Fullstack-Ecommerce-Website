import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './style/CartScreen.css';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

const CartScreen = () => {
    const { cartItems, removeFromCart, increaseQty, decreaseQty, clearCart } = useCart();
    const navigate = useNavigate(); // This is the "hook" that lets you change pages

    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    return (
        <div className="cart-screen">
        <div className="cart-items">
            <div className="cart-header">
            <h2>Your Shopping Cart</h2>
            {cartItems.length > 0 && (
                <button className="clear-btn" onClick={clearCart}>Clear All</button>
            )}
            </div>

            {cartItems.length === 0 ? (
            <p>Your cart is empty. <Link to="/">Go back to shopping</Link></p>
            ) : (
            cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                </div>
                
                <div className="qty-controls">
                    <button onClick={() => decreaseQty(item._id)}>-</button>
                    <span className="qty-num">{item.qty}</span>
                    <button onClick={() => increaseQty(item._id)}>+</button>
                </div>

                <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                    🗑️
                </button>
                
                </div>
            ))
            )}
        </div>

        {cartItems.length > 0 && (
        <div className="cart-summary">
            <h3>Subtotal</h3>
            <p>Total Items: {cartItems.reduce((acc, item) => acc + item.qty, 0)}</p>
            <p><strong>Total Price: ${totalPrice.toFixed(2)}</strong></p>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
            </button>
        </div>
        )}
        </div>
    );
};

export default CartScreen;