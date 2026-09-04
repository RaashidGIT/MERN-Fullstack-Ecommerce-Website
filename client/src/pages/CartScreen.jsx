// Here contains the logic for the Cart screen, which displays the items in the user's shopping cart, allows them to adjust quantities, remove items, clear the cart, and proceed to checkout.

import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './style/CartScreen.css';
import '../App.css'; 

const CartScreen = () => {
  const { cartItems, removeFromCart, increaseQty, decreaseQty, clearCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (Number(item.qty) || 1) * (Number(item.price) || 0), 
    0
  );

  const totalCount = cartItems.reduce(
    (acc, item) => acc + (Number(item.qty) || 1), 
    0
  );

  return (
    <div className="cart-screen">
      <div className="cart-items">
        <div className="cart-header">
          <h2>Your Shopping Cart</h2>
          {cartItems.length > 0 && (
            <button type="button" className="clear-btn" onClick={clearCart}>
              Clear All
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-cart-msg">
            Your cart is empty. <Link to="/">Go back to shopping</Link>
          </p>
        ) : (
          cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>${Number(item.price).toFixed(2)}</p>
              </div>
              
              <div className="qty-controls">
                <button 
                  type="button" 
                  onClick={() => decreaseQty(item._id)}
                  disabled={item.qty <= 1}
                >
                  -
                </button>
                <span className="qty-num">{item.qty}</span>
                <button 
                  type="button" 
                  onClick={() => increaseQty(item._id)}
                  disabled={item.countInStock !== undefined && item.qty >= item.countInStock}
                >
                  +
                </button>
              </div>

              <button 
                type="button" 
                className="remove-btn" 
                onClick={() => removeFromCart(item._id)}
                title="Remove item"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-summary">
          <h3>Subtotal</h3>
          <p>Total Items: {totalCount}</p>
          <p><strong>Total Price: ${totalPrice.toFixed(2)}</strong></p>
          <button 
            type="button" 
            className="checkout-btn" 
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartScreen;