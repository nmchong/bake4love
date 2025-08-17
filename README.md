# Bake4Love

Fully functional e-commerce paltform for a small bakery, featuring a dynamically-updating customer menu with pickup scheduling and payments, plus a fully customizable admin dashboard for the baker to manage availability, menu items, and orders.

---

## Components

**Primary Components**
- **Customer menu**: view menu, make payments, view order, receive email confirmations
- **Admin (baker) dashboard**: manage availability, edit menu items, view orders, create discounts
- **Database**: availability, menu items/images, orders, admin/baker authentication

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
- View order details given order ID
- Store orders and order items in Postgres database + Prisma

**Admin (baker) dashboard**
- Admin dashboard protected with Supabase Auth
- Easily view revenue earnings overview and upcoming pickup dates with orders
- Manage availability dates/timeslots and view orders-per-day via intuitive calendar UI
- Toggle menu item active status and day of week availability
- View upcoming and past orders and order details
- Add/edit menu items with flexibility for half vs full portions and Supabase Storage for images
- Create promotional discounts and display on customer menu, which interacts with the Stripe API's discount codes
- Store/interact with menu items, availability dates, and orders with Postgres database + Prisma
- SMTP email notifications when new order is placed and reminders for upcoming orders
