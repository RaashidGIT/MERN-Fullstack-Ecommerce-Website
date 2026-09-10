# Anime Loot ⚡

### Modern MERN E-Commerce Platform

A production-ready MERN stack e-commerce application engineered for the Indian retail ecosystem. Built with end-to-end Razorpay sandbox integration, automated 3PL logistics pipelines, dynamic order lifecycle state machines, and synchronized multi-vendor fulfillment dashboards.

---

## ✨ Features

### 🛍️ Buyer Experience

- **Payment Processing**  
  Dual-mode checkout supporting online payments (UPI, Cards, NetBanking via **Razorpay Test Gateway**) and **Cash on Delivery (COD)**.

- **Cryptographic Verification**  
  Server-side HMAC SHA-256 signature verification to prevent payment spoofing.

- **10-Minute Cancellation Grace Window**  
  Live synchronized countdown timers allowing buyers to cancel orders before dispatch.

- **Real-Time Order Tracking**  
  Multi-stage visual order tracking pipeline:
  `Order Placed → Packed → In Transit → Out for Delivery → Delivered`

- **Cart & Wishlist Engine**  
  Persistent cart and wishlist state with responsive inventory updates.

---

### 📦 Seller & Logistics Tools

- **Two-Tier Order Management**  
  Contextual item-specific buyer tables and a master order history view across all inventory listings.

- **3PL Mock Dispatch Engine**  
  Automated Air Waybill (**AWB**) generation using the format `AWB-IND-XXXXXX` with simulated courier assignment to **Delhivery Express**.

- **Printable Shipping Manifests**  
  On-demand dispatch labels containing:
  - Simulated barcodes
  - Routing codes
  - Buyer shipping addresses
  - Collectable COD information
  - Native print styling using `window.print()`

- **Order State Management**  
  Automated order transitions, including COD payment reconciliation upon delivery and status changes based on the cancellation grace window.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, React Router v6, Context API, CSS3 |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication & Security** | JWT, bcrypt.js, HMAC SHA-256 |
| **Payments** | Razorpay Checkout SDK |
| **Logistics** | Mock 3PL Barcode & Dispatch Pipeline |

---

## 🚀 Order Fulfillment State Machine

```text
                         ┌───────────────────────┐
                         │  CHECKOUT INITIATED   │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │ RAZORPAY / UPI   │              │       COD        │
          └────────┬─────────┘              └────────┬─────────┘
                   │                                 │
                   ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │ Payment          │              │ Order Created    │
          │ Successful       │              │ Payment Pending  │
          └────────┬─────────┘              └────────┬─────────┘
                   │                                 │
                   ▼                                 │
          ┌──────────────────┐                       │
          │ Verify Razorpay  │                       │
          │ HMAC Signature   │                       │
          └────────┬─────────┘                       │
                   │                                 │
                   ▼                                 │
          ┌──────────────────┐                       │
          │ Payment Verified │                       │
          │ Order = PAID     │                       │
          └────────┬─────────┘                       │
                   │                                 │
                   └────────────────┬────────────────┘
                                    │
                                    ▼
                         ┌───────────────────────┐
                         │    ORDER CREATED     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ PENDING / 10 MINUTES  │
                         │                       │
                         │ Buyer Can Cancel      │
                         └───────────┬───────────┘
                                     │
                         ┌───────────┴───────────┐
                         │                       │
                         ▼                       ▼
                ┌────────────────┐      ┌────────────────┐
                │ BUYER CANCELS  │      │ 10 MINUTES     │
                └───────┬────────┘      │ HAVE PASSED    │
                        │               └───────┬────────┘
                        ▼                       ▼
                ┌────────────────┐      ┌────────────────┐
                │   CANCELLED    │      │ READY TO SHIP  │
                └────────────────┘      └───────┬────────┘
                                                │
                                                ▼
                                      ┌────────────────────┐
                                      │ Seller Generates   │
                                      │ AWB                │
                                      └──────────┬─────────┘
                                                 │
                                                 ▼
                                      ┌────────────────────┐
                                      │      SHIPPED       │
                                      └──────────┬─────────┘
                                                 │
                                                 ▼
                                      ┌────────────────────┐
                                      │    IN TRANSIT      │
                                      └──────────┬─────────┘
                                                 │
                                                 ▼
                                      ┌────────────────────┐
                                      │     DELIVERED      │
                                      │  Seller Confirms   │
                                      └──────────┬─────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │                         │
                                    ▼                         ▼
                           ┌────────────────┐       ┌────────────────┐
                           │    PREPAID     │       │      COD       │
                           │ Already Paid   │       │ Payment Pending│
                           └────────────────┘       └───────┬────────┘
                                                            │
                                                            ▼
                                                   ┌────────────────┐
                                                   │   MARK PAID    │
                                                   └───────┬────────┘
                                                           │
                                                           ▼
                                                   ┌────────────────┐
                                                   │      PAID      │
                                                   └────────────────┘
````

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/animeloot?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_key

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

> **Important:** Never commit your `.env` file to Git.
> An `.env.example` template is provided for reference.

---

## 💻 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/anime-loot.git
cd anime-loot
```

### 2. Install Dependencies

Install the backend dependencies:

```bash
npm install
```

Install the frontend dependencies:

```bash
cd client
npm install
cd ..
```

### 3. Run the Development Servers

```bash
npm run dev
```

The application will be available at:

| Service         | URL                                                |
| --------------- | -------------------------------------------------- |
| **Backend API** | `http://localhost:5000`                            |
| **Frontend**    | `http://localhost:3000` or `http://localhost:5173` |

> If your project does not have a combined `npm run dev` script, run the backend and frontend development servers separately.

---

## 🧪 Testing

The payment system uses **Razorpay Test Mode**, allowing the payment workflow to be demonstrated without real-money transactions.

| Parameter                     | Test Value                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| **Razorpay Test UPI ID**      | `success@razorpay`                                                                    |
| **Razorpay Test Cards**       | [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/) |
| **Cancellation Grace Window** | 10 minutes from order creation                                                        |
| **Courier Partner**           | Delhivery Express Surface *(Simulated)*                                               |

---

## 📡 API Endpoints

### Orders & Payments

| Method | Endpoint                            | Description                            | Access          |
| ------ | ----------------------------------- | -------------------------------------- | --------------- |
| `POST` | `/api/orders`                       | Create preliminary order record        | Private         |
| `POST` | `/api/orders/razorpay/create-order` | Generate Razorpay transaction order    | Private         |
| `POST` | `/api/orders/razorpay/verify`       | Verify cryptographic payment signature | Private         |
| `PUT`  | `/api/orders/:id/cancel`            | Cancel order within 10-minute window   | Private — Buyer |

### Logistics & Fulfillment

| Method | Endpoint                        | Description                                         | Access           |
| ------ | ------------------------------- | --------------------------------------------------- | ---------------- |
| `GET`  | `/api/orders/seller/all-orders` | Fetch master sales history for seller               | Private — Seller |
| `GET`  | `/api/products/:id/orders`      | Fetch orders for a specific product                 | Private — Seller |
| `PUT`  | `/api/orders/:id/dispatch`      | Assign AWB tracking code and update shipping status | Private — Seller |
| `PUT`  | `/api/orders/:id/deliver`       | Mark package as delivered and reconcile COD payment | Private — Seller |

---

## 📁 Project Structure

```text
anime-loot/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

## 📜 License

Distributed under the **MIT License**.

See `LICENSE` for more information.

```

One thing I deliberately changed is the **state-machine diagram wording**: I kept your actual flow but made the payment and fulfillment paths visually separate so the README doesn't imply that COD goes through Razorpay/HMAC verification.
```
