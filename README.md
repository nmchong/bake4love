# Bake4Love

Fully functional e-commerce platform for a small bakery, featuring a dynamically-updating customer menu with pickup scheduling and payments, plus an admin dashboard for the baker to manage availability, menu items, and orders.

---

## Components

**Primary Components**
- **Customer menu**: view menu, make payments, view order, receive email confirmations
- **Admin (baker) dashboard**: manage availability, edit menu items, view orders, create discounts
- **Database**: availability, menu items/images, orders, admin authentication

**Technologies**
- **Stack**: Next.js, TypeScript, Tailwind
- **Database**: PostgreSQL (Supabase), Prisma, Supabase Storage (images)
- **Auth**: Supabase Auth
- **Other**: Stripe (payments), SMTP (emails)

---

## Features

**Customer menu**
- View and select available dates & timeslots for order pickup
- Add promotion/discount codes and optional tip to orders
- Integrated payments via Stripe checkout
- Order confirmations with SMTP emails and Stripe receipts
- View order details from order ID
- Store orders and order items in Postgres database + Prisma

**Admin (baker) dashboard**
- Admin dashboard protected with Supabase Auth
- Easily view revenue earnings overview and upcoming pickup dates with orders
- Manage availability dates/timeslots and view orders-per-day via intuitive calendar UI
- Toggle menu item active status and day of week availability
- View upcoming and past orders and order details
- Add/edit menu items with flexibility for half vs full portions and Supabase Storage for images
- Create promotional discounts and display on customer menu via Stripe API's discount codes
- Store/interact with menu items, availability dates, and orders with Postgres database + Prisma
- SMTP email notifications when new orders are placed

---

## Screenshots
<img width="1510" height="855" alt="Screenshot 2025-09-18 at 5 19 45 PM" src="https://github.com/user-attachments/assets/3ca6b42d-62fd-4efe-b54b-c617dd2cff7d" />
<img width="1353" height="853" alt="Screenshot 2025-12-02 at 10 58 37 PM" src="https://github.com/user-attachments/assets/d7faeedb-4903-4aed-be28-b3cacbd58aea" />
<img width="1509" height="855" alt="Screenshot 2025-09-18 at 5 19 57 PM" src="https://github.com/user-attachments/assets/c6fecffa-6278-4236-b09e-db065fd6e079" />
<img width="1506" height="854" alt="Screenshot 2025-09-18 at 5 20 43 PM" src="https://github.com/user-attachments/assets/adda2bb8-225c-4ee4-904d-13eea917f529" />
