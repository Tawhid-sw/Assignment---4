GearUp 🏋️ - Complete API Flow Guide
"Rent Sports & Outdoor Gear Instantly"
This guide walks you through the entire GearUp journey — from creating an account to returning gear and leaving a review.
📋 Table of Contents
Quick Overview
Full User Journey
Step-by-Step API Flow
All API Endpoints
Status Flow Diagram
Error Handling
🚀 Quick Overview
plain
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ REGISTER │───▶│ LOGIN │───▶│ BROWSE GEAR │───▶│ PLACE ORDER │───▶│ PAY │───▶│ PICK UP │───▶│ RETURN + │
│ (Customer) │ │ (Customer) │ │ │ │ │ │ (Stripe) │ │ (Provider) │ │ REVIEW │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
👤 Full User Journey
Box 1: Create Account
plain
┌─────────────────────────────────────────────────────────────┐
│ POST /api/auth/register │
│ │
│ Request Body: │
│ { │
│ "name": "John Doe", │
│ "email": "john@example.com", │
│ "password": "password123", │
│ "role": "CUSTOMER" ← or "PROVIDER" │
│ } │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "data": { │
│ "user": { │
│ "id": "cab2be34-b05c-4825-84bc-187ea55eede3", │
│ "name": "John Doe", │
│ "email": "john@example.com", │
│ "role": "CUSTOMER" │
│ }, │
│ "accessToken": "eyJhbGciOiJIUzI1NiIs...", │
│ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." │
│ } │
│ } │
└─────────────────────────────────────────────────────────────┘
Box 2: Login
plain
┌─────────────────────────────────────────────────────────────┐
│ POST /api/auth/login │
│ │
│ Request Body: │
│ { │
│ "email": "john@example.com", │
│ "password": "password123" │
│ } │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "data": { │
│ "user": { "id": "cab2be34-...", "role": "CUSTOMER" },│
│ "accessToken": "eyJhbGciOiJIUzI1NiIs..." │
│ } │
│ } │
│ │
│ 💡 Cookies are automatically set (accessToken + refresh) │
└─────────────────────────────────────────────────────────────┘
Box 3: Browse Gear (Public)
plain
┌─────────────────────────────────────────────────────────────┐
│ GET /api/gear │
│ │
│ Query Params (optional): │
│ ?category=camping&brand=Coleman&minPrice=10&maxPrice=100 │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "data": [ │
│ { │
│ "id": "e03d265e-a80e-4796-a59f-72c271501d67", │
│ "name": "Premium Tent", │
│ "brand": "Coleman", │
│ "pricePerDay": 25.00, │
│ "stockQuantity": 5, │
│ "category": { "name": "Camping", "slug": "camping" }│
│ } │
│ ] │
│ } │
└─────────────────────────────────────────────────────────────┘
Box 4: Create Rental Order
plain
┌─────────────────────────────────────────────────────────────┐
│ POST /api/rentals │
│ Headers: Authorization: Bearer <accessToken> │
│ │
│ Request Body: │
│ { │
│ "startDate": "2026-08-01", │
│ "endDate": "2026-08-05", │
│ "items": [ │
│ { │
│ "gearItemId": "e03d265e-a80e-4796-a59f-72c271501d67",│
│ "quantity": 1 │
│ }, │
│ { │
│ "gearItemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",│
│ "quantity": 2 │
│ } │
│ ] │
│ } │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "data": { │
│ "id": "9c5fc231-fa8c-4ee4-83a4-db96a65a7dfe", │
│ "status": "PLACED", │
│ "totalAmount": "2400.00", │
│ "startDate": "2026-08-01", │
│ "endDate": "2026-08-05", │
│ "rentalItems": [...] │
│ } │
│ } │
│ │
│ 📝 SAVE THIS ORDER ID: 9c5fc231-fa8c-4ee4-83a4-db96a65a7dfe│
└─────────────────────────────────────────────────────────────┘
Box 5: Provider Confirms Order
plain
┌─────────────────────────────────────────────────────────────┐
│ PROVIDER logs in → PATCH /api/provider/orders/{orderId} │
│ Headers: Authorization: Bearer <providerToken> │
│ │
│ Request Body: │
│ { │
│ "status": "CONFIRMED" │
│ } │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "data": { │
│ "id": "9c5fc231-fa8c-4ee4-83a4-db96a65a7dfe", │
│ "status": "CONFIRMED" │
│ } │
│ } │
└─────────────────────────────────────────────────────────────┘
Box 6: Customer Pays (Stripe)
plain
┌─────────────────────────────────────────────────────────────┐
│ POST /api/payments/create │
│ Headers: Authorization: Bearer <customerToken> │
│ │
│ Request Body: │
│ { │
│ "rentalOrderId": "9c5fc231-fa8c-4ee4-83a4-db96a65a7dfe" │
│ } │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "data": { │
│ "payment": { │
│ "id": "pay_abc123", │
│ "status": "PENDING", │
│ "amount": "2400.00" │
│ }, │
│ "clientSecret": "pi_xxx_secret_yyy" │
│ } │
│ } │
│ │
│ 💳 Use clientSecret in frontend Stripe SDK │
│ 🔁 Stripe webhook auto-confirms → status becomes PAID │
└─────────────────────────────────────────────────────────────┘
Box 7: Provider Marks Picked Up
plain
┌─────────────────────────────────────────────────────────────┐
│ PATCH /api/provider/orders/{orderId}/pickup │
│ Headers: Authorization: Bearer <providerToken> │
│ │
│ Request Body: │
│ { │
│ "status": "PICKED_UP" │
│ } │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "data": { │
│ "id": "9c5fc231-fa8c-4ee4-83a4-db96a65a7dfe", │
│ "status": "PICKED_UP" │
│ } │
│ } │
└─────────────────────────────────────────────────────────────┘
Box 8: Customer Returns + Reviews (ATOMIC)
plain
┌─────────────────────────────────────────────────────────────┐
│ PATCH /api/rentals/{orderId}/return │
│ Headers: Authorization: Bearer <customerToken> │
│ │
│ Request Body: │
│ { │
│ "reviews": [ │
│ { │
│ "gearItemId": "e03d265e-a80e-4796-a59f-72c271501d67",│
│ "rating": 5, │
│ "comment": "Excellent tent, very spacious!" │
│ }, │
│ { │
│ "gearItemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",│
│ "rating": 4, │
│ "comment": "Good quality sleeping bag" │
│ } │
│ ] │
│ } │
│ │
│ ✅ Requirements: │
│ • Order must be PICKED_UP │
│ • Payment must be COMPLETED │
│ • Every gear item must have a review │
│ • Rating: 1-5, Comment: optional │
│ │
│ Response: │
│ { │
│ "success": true, │
│ "message": "Items returned and reviewed successfully", │
│ "data": { │
│ "order": { │
│ "id": "9c5fc231-fa8c-4ee4-83a4-db96a65a7dfe", │
│ "status": "RETURNED", │
│ "rentalItems": [...] │
│ }, │
│ "reviews": [ │
│ { "id": "rev_1", "rating": 5, "gearItemId": "..." },│
│ { "id": "rev_2", "rating": 4, "gearItemId": "..." } │
│ ] │
│ } │
│ } │
│ │
│ 🔄 Stock quantities restored automatically │
│ 🔒 All happens in ONE atomic transaction │
└─────────────────────────────────────────────────────────────┘
📊 Complete Status Flow Diagram
plain
┌──────────────┐
│ PLACED │
│ (Customer │
│ creates) │
└──────┬───────┘
│
┌────────────────┼────────────────┐
│ │ │
▼ │ ▼
┌──────────────┐ │ ┌──────────────┐
│ CONFIRMED │ │ │ CANCELLED │
│ (Provider │ │ │ (Customer/ │
│ confirms) │ │ │ Provider) │
└──────┬───────┘ │ └──────────────┘
│ │
▼ │
┌──────────────┐ │
│ PAID │ │
│ (Stripe │ │
│ webhook) │ │
└──────┬───────┘ │
│ │
▼ │
┌──────────────┐ │
│ PICKED_UP │ │
│ (Provider │ │
│ marks) │ │
└──────┬───────┘ │
│ │
▼ │
┌──────────────┐ │
│ RETURNED │◄────────┘
│ (Customer │
│ returns + │
│ reviews) │
└──────────────┘
🔗 All API Endpoints
Authentication
Table
Method Endpoint Auth Description
POST /api/auth/register Public Register as CUSTOMER or PROVIDER
POST /api/auth/login Public Login, sets JWT cookies
POST /api/auth/refresh-token Cookie Refresh access token
GET /api/auth/profile Bearer/Cookie Get current user profile
PUT /api/auth/update-profile Bearer/Cookie Update name/avatar
Categories (Public)
Table
Method Endpoint Auth Description
GET /api/categories Public List all categories
GET /api/categories/{id} Public Get category by ID
POST /api/categories/create-new-category Admin Create category
PUT /api/categories/update-category/{id} Admin Update category
DELETE /api/categories/delete-category/{id} Admin Delete category
Gear
Table
Method Endpoint Auth Description
GET /api/gear Public List gear (with filters)
GET /api/gear/{id} Public Get gear details
POST /api/gear/create-new-gear Provider Add gear to inventory
PUT /api/gear/update-gear/{id} Provider Update gear
DELETE /api/gear/delete-gear/{id} Provider Delete gear
GET /api/gear/provider-inventory Provider View my inventory
Rentals (Customer)
Table
Method Endpoint Auth Description
POST /api/rentals Customer Create rental order
GET /api/rentals Customer My rental orders
GET /api/rentals/{id} Customer Order details
PATCH /api/rentals/{id}/return Customer Return + Review
Provider Orders
Table
Method Endpoint Auth Description
GET /api/provider/orders Provider View incoming orders
PATCH /api/provider/orders/{id} Provider Update status (CONFIRMED/CANCELLED)
PATCH /api/provider/orders/{id}/pickup Provider Mark as PICKED_UP
Payments
Table
Method Endpoint Auth Description
POST /api/payments/create Customer Create payment intent
POST /api/payments/confirm Webhook Stripe webhook confirmation
GET /api/payments Customer Payment history
GET /api/payments/{id} Customer Payment details
Reviews (Public Read Only)
Table
Method Endpoint Auth Description
GET /api/reviews/gear/{gearItemId} Public Get reviews for gear
💡 Reviews are created automatically during return via /api/rentals/{id}/return
Admin
Table
Method Endpoint Auth Description
GET /api/admin/users Admin List all users
PATCH /api/admin/users/{id} Admin Update user status
GET /api/admin/gear Admin List all gear
GET /api/admin/rentals Admin List all orders
⚠️ Error Handling
Table
Status Meaning Example
400 Bad Request Validation error, invalid status transition
401 Unauthorized Missing/invalid token
403 Forbidden Wrong role (e.g., Customer accessing provider route)
404 Not Found Order/gear/user doesn't exist
500 Server Error Database issue, unexpected error
Common Error Messages
JSON
// Return without payment
{
"success": false,
"message": "Order must be paid before it can be returned"
}

// Return from wrong status
{
"success": false,
"message": "Cannot move order from "PLACED" to "RETURNED". Allowed: CONFIRMED, CANCELLED"
}

// Review gear not in order
{
"success": false,
"message": "Gear item "xxx" is not part of this rental order"
}

// Already reviewed
{
"success": false,
"message": "You have already reviewed: gear-id-1"
}
🧪 Quick Test Script
bash

# 1. Register

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"pass123","role":"CUSTOMER"}' | jq -r '.data.accessToken')

# 2. Create order

ORDER=$(curl -s -X POST http://localhost:3000/api/rentals -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"startDate":"2026-08-01","endDate":"2026-08-05","items":[{"gearItemId":"gear-id","quantity":1}]}' | jq -r '.data.id')

# 3. Return + Review

curl -X PATCH "http://localhost:3000/api/rentals/$ORDER/return" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"reviews":[{"gearItemId":"gear-id","rating":5,"comment":"Great!"}]}'
Built with ❤️ using Node.js, Express, Prisma & PostgreSQL
