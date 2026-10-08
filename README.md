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
                         │    ORDER CREATED      │
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

## 📸 Screenshots

| **Home Page** | **Product Details 1** |
| :---: | :---: |
| <img width="1881" height="860" alt="Screenshot 2026-10-08 202008" src="https://github.com/user-attachments/assets/602698a1-d00f-4735-ad38-d405c6fdace0" /> | <img width="1891" height="857" alt="Screenshot 2026-10-08 202035" src="https://github.com/user-attachments/assets/b00190e7-4d61-4cef-9cc0-7d4f878ddc10" /> |
| **Product Details 2** | **Login Page** |
| <img width="1896" height="840" alt="Screenshot 2026-10-08 202047" src="https://github.com/user-attachments/assets/5026aadf-2227-4e7e-8efe-2036f99d380a" />
| <img width="800" height="671" alt="Screenshot 2026-10-08 202119" src="https://github.com/user-attachments/assets/74dd639d-776d-4aa7-9fae-1f9d0b94a68d" /> |
| **Dashboard/Wishlist** | **Order History** |
| <img width="1866" height="838" alt="Screenshot 2026-10-08 202231" src="https://github.com/user-attachments/assets/9e477233-51ab-4f87-b560-d0c6c4fd9999" /> | <img width="1205" height="732" alt="Screenshot 2026-10-08 210609" src="https://github.com/user-attachments/assets/d08df76f-872a-476a-9a77-ecbcc62772b6" /> |
| **My Listings** | **My Listings 2** |
| <img width="1855" height="747" alt="Screenshot 2026-10-08 202252" src="https://github.com/user-attachments/assets/f67d7f6f-0b31-4382-9f34-2ddf6929ef43" />
 | <img width="1852" height="747" alt="Screenshot 2026-10-08 202304" src="https://github.com/user-attachments/assets/b6470ec8-a260-42be-adf2-9777f20eb5b4" />
 |
| **About Account** | **Cart Screen** |
| <img width="1815" height="722" alt="Screenshot 2026-10-08 202314" src="https://github.com/user-attachments/assets/f53d4b49-45b9-45ba-9bc6-65583c7fd675" />
 | <img width="1890" height="845" alt="Screenshot 2026-10-08 202347" src="https://github.com/user-attachments/assets/25f2739c-c6cc-42b2-b437-2840778d0906" />
 |
| **Cart Screen 2** | **Vendor Listing** |
| <img width="1610" height="761" alt="Screenshot 2026-10-08 202357" src="https://github.com/user-attachments/assets/ce8bfe99-3411-4c94-80ca-bba474a76234" /> | 
<img width="940" height="706" alt="Screenshot 2026-10-08 202930" src="https://github.com/user-attachments/assets/8c377e70-41af-41e7-b6cb-303a645edd91" /> |

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
