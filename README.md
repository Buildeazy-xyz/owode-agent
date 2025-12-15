# Owode Agent Management System

A full-stack web application for managing agents, customers, and payments with notifications via email and SMS.

## Features

- Agent registration and approval system
- JWT-based authentication for agents
- Customer management (CRUD)
- Payment recording with balance updates
- Notification system (SMS via Twilio, Email via Resend)
- Responsive UI with Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- Resend for email notifications
- Twilio for SMS notifications

### Frontend
- React + React Router
- Tailwind CSS
- Axios for API calls

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Twilio account with SMS-enabled phone number
- Resend account for email notifications

### Backend Setup

1. Navigate to the `owodeagent-backend` folder:
   ```
   cd owodeagent-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
    - **MONGO_URI**: Your MongoDB connection string
    - **JWT_SECRET**: A secure random string for JWT tokens
    - **MAILGUN_API_KEY**: Your Mailgun private API key
    - **MAILGUN_DOMAIN**: Your verified Mailgun domain (owodealajo.com)
    - **TWILIO_ACCOUNT_SID**: Your Twilio Account SID
    - **TWILIO_AUTH_TOKEN**: Your Twilio Auth Token
    - **TWILIO_PHONE_NUMBER**: Your Twilio phone number (must be SMS-enabled)
    - **ADMIN_EMAIL**: Email address for admin notifications

5. Start MongoDB (if running locally).

6. Run the backend:
   ```
   npm run dev
   ```
   Server will run on http://localhost:5000

### Twilio SMS Setup

1. **Create a Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)

2. **Upgrade to Paid Account**: Trial accounts have severe restrictions. Upgrade to send SMS globally.

3. **Purchase a Phone Number**:
   - Go to Phone Numbers → Manage → Buy a Number
   - Choose a number that supports SMS
   - For international SMS (like Nigeria), ensure the number supports international messaging

4. **Configure Geographic Permissions**:
   - In Console → Phone Numbers → Manage → Geographic Permissions
   - Enable SMS for Nigeria (NG) and other target countries

5. **Get Your Credentials**:
   - Account SID: Found in your Twilio Console Dashboard
   - Auth Token: Found in your Twilio Console Dashboard
   - Phone Number: Your purchased SMS-enabled number

6. **Test SMS**: Use the test endpoint to verify SMS functionality:
   ```bash
   curl -X POST http://localhost:5000/auth/test-sms \
     -H "Content-Type: application/json" \
     -d '{"phone": "+2348020973590", "message": "Test SMS from Owode Agent"}'
   ```

7. **Check SMS Status**: After sending, check the message status in your Twilio Console under Messaging → Logs

**Important Notes for Trial Accounts:**
- Trial accounts can ONLY send SMS to verified phone numbers
- You must verify each recipient phone number in your Twilio Console
- Trial accounts have daily/monthly limits
- Geographic restrictions apply

**To Verify a Phone Number for Trial Account:**
1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to Phone Numbers → Manage → Verified Caller IDs
3. Click "Add a new Caller ID"
4. Enter the phone number: `+2348020973590`
5. Twilio will call or send a verification code to that number
6. Complete the verification process
7. Only then can you send SMS to that number

**For Production Use:**
- Upgrade your Twilio account
- Purchase appropriate phone numbers
- Configure geographic permissions
- Monitor usage and costs

### Troubleshooting Email Delivery Issues

**Problem: Email shows "accepted" in Mailgun logs but doesn't reach Gmail**

**Possible Causes & Solutions:**

1. **Domain Not Properly Verified**
   - Go to Mailgun Dashboard → Sending → Domains
   - Click on `owodealajo.com`
   - Ensure all DNS records are correctly added to your domain registrar
   - Use Mailgun's "Check DNS Records" tool

2. **Gmail Spam Filters**
   - Check Gmail's spam/junk folder
   - Add `noreply@owodealajo.com` to contacts
   - Send a few test emails to warm up the domain reputation

3. **Domain Reputation**
   - New domains take time to build reputation
   - Avoid sending too many emails at once
   - Monitor bounce rates in Mailgun dashboard

4. **Test Email Delivery**
   ```bash
   curl -X POST http://localhost:5000/auth/test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "your-email@gmail.com", "subject": "Test", "message": "Test message"}'
   ```

5. **Check Mailgun Logs**
   - Go to Mailgun Dashboard → Sending → Logs
   - Look for delivery events, not just "accepted"
   - Check for bounce or complaint events

6. **IP Reputation**
   - If using shared IP, it might be blacklisted
   - Consider upgrading to dedicated IP for better deliverability

### Email Setup (Mailgun)

1. **Create a Mailgun Account**: Sign up at [mailgun.com](https://www.mailgun.com)

2. **Add and Verify Domain**: Add `owodealajo.com` to your Mailgun account and verify it

3. **Get API Key**: Generate a private API key from your Mailgun dashboard

4. **Configure DNS Records**: Add the required TXT, MX, and CNAME records to your domain DNS settings

5. **Test Domain**: Use Mailgun's domain verification tool to ensure everything is set up correctly

### Frontend Setup

1. Navigate to the `frontend` folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend:
   ```
   npm start
   ```
   App will run on http://localhost:3000

## Usage

1. **Agent Registration**: Register as an agent at `/register`. You'll receive an SMS welcome message.
2. **Admin Approval**: Wait for admin approval (email notification sent to info@owodealajo.com). Admin can approve via `/admin` dashboard or API. Email and SMS confirmation sent immediately upon approval.
3. **Agent Login**: Once approved, login at `/login`. Unapproved agents cannot log in.
4. **Dashboard Access**: Manage customers and payments from the dashboard.
5. **Customer Management**: Create customers (they receive SMS welcome messages).
6. **Payment Recording**: Record payments with optional SMS/email notifications to customers.
7. **Customer Deletion**: Request customer deletion (requires admin approval via email to info@owodealajo.com). Admin can approve/deny directly from email links or use the admin dashboard.

## Notification Features

### SMS Notifications (Twilio)
- **Agent Registration**: Welcome SMS sent to new agents
- **Agent Approval**: Immediate SMS + email confirmation
- **Customer Creation**: Welcome SMS with contribution details
- **Payment Confirmations**: SMS notifications for payments (optional per transaction)
- **Customer Deletion**: Approval/denial notifications via SMS

### Email Notifications (Resend)
- **Agent Registration**: Admin notification email
- **Agent Approval**: Professional HTML email sent immediately
- **Customer Creation**: Welcome email with account details (if email provided)
- **Payment Confirmations**: HTML email receipts (if email provided)
- **Customer Deletion**: Admin requests and approval/denial notifications

### Testing Notifications

**Test SMS Endpoint**:
```bash
curl -X POST http://localhost:5000/auth/test-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "message": "Test SMS from Owode Agent"}'
```

**Phone Number Format**: Always use E.164 format (+countrycode) for SMS delivery.

## API Endpoints

### Auth
- POST /auth/register-agent - Register a new agent
- POST /auth/approve-agent - Admin approval of agent
- POST /auth/login - Agent login
- GET /auth/pending-agents - Get pending agent approvals (admin)
- POST /auth/test-sms - Test SMS functionality (development only)

### Customers
- GET /customers/list - Get all customers for logged-in agent
- POST /customers/create - Create a new customer
- POST /customers/request-deletion - Request customer deletion (agent)
- POST /customers/approve-deletion - Approve/deny customer deletion (admin)
- GET /customers/approve-deletion/:customerId - Approve customer deletion via email link
- GET /customers/deny-deletion/:customerId - Deny customer deletion via email link
- GET /customers/pending-deletions - Get pending customer deletion requests (admin)

### Payments
- POST /payments/add - Record a payment for a customer
- GET /payments/list - Get payment history (internal use)

## Notes

- Phone validation accepts both international format (+countrycode) and local format (10-15 digits).
- Ensure Twilio and Resend accounts are set up with proper domains/numbers.
- For production, use environment variables securely.