```markdown
# Anime Loot ⚡ Modern E-Commerce Platform

A production-ready MERN stack e-commerce application engineered for the Indian retail ecosystem. Built with end-to-end Razorpay sandbox integration, automated 3PL logistics pipelines, dynamic order lifecycle state machines, and synchronized multi-vendor fulfillment dashboards.

---

## ✨ Features Overview

### 🛍️ Buyer Experience
* **Payment Processing**: Dual-mode checkout supporting online payments (UPI, Cards, NetBanking via **Razorpay Test Gateway**) and **Cash on Delivery (COD)**.
* **Cryptographic Verification**: Server-side HMAC SHA-256 signature verification preventing payment spoofing.
* **10-Minute Cancellation Grace Window**: Live synchronized countdown timers allowing instant buyer-side cancellations prior to dispatch.
* **Real-time Order Stepper**: Multi-stage visual tracking pipeline (`Order Placed` ➔ `Packed` ➔ `In Transit` ➔ `Out for Delivery` ➔ `Delivered`).
* **Cart & Wishlist Engine**: Persistent state storage with responsive inventory updates.

### 📦 Seller & Logistics Tools
* **Two-Tier Management**: Contextual item-specific buyer tables and a Master Order History view across all inventory listings.
* **3PL Mock Dispatch Engine**: Automated Air Waybill (**AWB**) generation (`AWB-IND-XXXXXX`) and courier assignment (Delhivery Express).
* **Printable Shipping Manifests**: On-demand dispatch labels complete with simulated barcodes, routing codes, buyer shipping addresses, and collectable COD metrics with native print styling (`window.print()`).
* **State Management**: Automated transitions resolving COD cash collections upon delivery and shifting statuses dynamically based on real-time grace windows.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, React Router v6, Context API (User, Cart, Wishlist), CSS3 Modules
* **Backend**: Node.js, Express.js (ES Modules)
* **Database**: MongoDB with Mongoose ODM
* **Security & Auth**: JSON Web Tokens (JWT), bcrypt.js password hashing, HMAC SHA-256 signatures
* **Logistics & Payments**: Razorpay Checkout SDK, Mock 3PL Barcode & Dispatch Pipeline

---

## 🚀 Order Fulfillment State Machine


```

```
                       [ CHECKOUT INITIATED ]
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             [ RAZORPAY / UPI ]              [ COD ]
                    │                           │
                    ▼                           ▼
          [ Payment Successful ]        [ Order Created ]
                    │                    [ Payment Pending ]
                    ▼                           │
          [ Verify Razorpay HMAC ]              │
                    │                           │
                    ▼                           │
            [ Payment Verified ]                │
            [ Order = PAID ]                    │
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                         [ ORDER CREATED ]
                                  │
                                  ▼
                         [ PENDING / 10 MIN ]
                         Buyer can cancel
                                  │
                         ┌────────┴────────┐
                         │                 │
                  [ Buyer Cancels ]   [ 10 Minutes ]
                         │                 │
                         ▼                 ▼
                    [ CANCELLED ]    [ READY TO SHIP ]
                                           │
                                           ▼
                                  [ Seller Generates AWB ]
                                           │
                                           ▼
                                      [ SHIPPED ]
                                           │
                                           ▼
                                    [ IN TRANSIT ]
                                           │
                                           ▼
                                [ CONFIRMED DELIVERED ]
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                        [ PREPAID ]                   [ COD ]
                              │                         │
                              ▼                         ▼
                        Already PAID             [ Mark as PAID ]
                                                        │
                                                        ▼
                                                    [ PAID ]
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/animeloot?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

```

> **Note**: Never push your `.env` file to Git. An `.env.example` template is provided for quick reference.

---

## 💻 Local Development Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/](https://github.com/)<your-username>/anime-loot.git
cd anime-loot

```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client # or frontend, depending on your folder structure
npm install
cd ..

```

### 3. Run Development Servers

```bash
# Run both servers concurrently (or run backend & frontend separately)
npm run dev

```

* Backend API: `http://localhost:5000`
* Frontend App: `http://localhost:3000` (or `http://localhost:5173`)

---

## 🧪 Testing Credentials

To test payment and order pipelines without spending real money:

| Parameter | Test Value |
| --- | --- |
| **Razorpay Test UPI ID** | `success@razorpay` |
| **Razorpay Cards** | Use standard [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/) |
| **Grace Window** | 10 Minutes from order creation |
| **Courier Partner** | Delhivery Express Surface (Simulated) |

---

## 📡 Key API Endpoints

### Orders & Payments

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/orders` | Create preliminary order record | Private |
| `POST` | `/api/orders/razorpay/create-order` | Generate Razorpay transaction order | Private |
| `POST` | `/api/orders/razorpay/verify` | Verify cryptographic payment signature | Private |
| `PUT` | `/api/orders/:id/cancel` | Cancel order within 10-min window | Private (Buyer) |

### Logistics & Fulfillment

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/orders/seller/all-orders` | Fetch master sales history for seller | Private (Seller) |
| `GET` | `/api/products/:id/orders` | Fetch orders specific to a listed product | Private (Seller) |
| `PUT` | `/api/orders/:id/dispatch` | Assign AWB tracking code & set `IN_TRANSIT` | Private (Seller) |
| `PUT` | `/api/orders/:id/deliver` | Mark package delivered (reconciles COD) | Private (Seller) |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

```

```
