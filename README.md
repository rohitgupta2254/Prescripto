# Prescripto - Doctor Appointment Booking System

A comprehensive full-stack application for booking doctor appointments with integrated payment processing, email notifications, and appointment reminders.

## 🎯 Features

- **Doctor Management**: Doctor registration, profile management, and availability scheduling
- **Patient Management**: Patient registration, profile management, and appointment history
- **Appointment Booking**: Real-time slot selection and appointment scheduling
- **Payment Processing**: Integrated Stripe payment system for appointment confirmation
- **Email Notifications**: Automated email confirmations, reminders, and receipts
- **SMS Reminders**: Twilio-based SMS appointment reminders
- **Reviews & Ratings**: Patient reviews and star ratings for doctors
- **Admin Dashboard**: Doctor and patient dashboards for management
- **Search & Filters**: Advanced doctor search with specialty and location filters
- **Secure Authentication**: JWT-based authentication for doctors and patients

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Stripe API** - Payment processing
- **Nodemailer** - Email service
- **Twilio** - SMS service
- **Node-Cron** - Job scheduling

### Frontend
- **React 18** - UI library
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Stripe React** - Payment UI
- **React DatePicker** - Date selection
- **CSS3** - Styling

## 📁 Project Structure

```
Prescripto/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   ├── styles/        # CSS files
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
│   └── package.json
│
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/       # Request controllers
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic services
│   ├── jobs/             # Cron jobs
│   ├── server.js         # Server entry point
│   └── package.json
│
├── database/
│   └── schema.sql        # Database schema
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Stripe account
- Gmail account (for email service)
- Twilio account (for SMS service)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Prescripto
   ```

2. **Setup Database**
   ```bash
   mysql -u your_username -p
   CREATE DATABASE prescripto;
   USE prescripto;
   source database/schema.sql;
   ```

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the server directory
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=prescripto
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Email Configuration
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # SMS Configuration (Twilio)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to client directory** (from project root)
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the client directory
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   Application will open at http://localhost:3000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor details
- `POST /api/doctors/register` - Register new doctor
- `PUT /api/doctors/:id` - Update doctor profile
- `GET /api/doctors/:id/availability` - Get doctor availability

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/:id/slots` - Get available slots

### Payments
- `POST /api/payments` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook

### Reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/:doctorId` - Get doctor reviews
- `PUT /api/reviews/:id` - Update review

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id` - Mark as read

## 🗄️ Database Schema

### Core Tables
- **doctors** - Doctor profiles
- **doctor_timings** - Doctor availability
- **patients** - Patient profiles
- **appointments** - Appointment records
- **payments** - Payment transactions
- **reviews** - Doctor reviews
- **email_notifications** - Email logs
- **appointment_reminders** - Reminder logs

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in `localStorage` as `prescripto_token`
- Token is validated on every API request
- Expired tokens trigger automatic logout
- Protected routes require valid authentication

## 💳 Payment Integration

Stripe is used for payment processing:
- Payment intents are created on the backend
- Client-side Stripe Elements handle card collection
- Webhook verifies successful payments
- Failed payments are logged and tracked

## 📧 Email Service

Automated emails are sent for:
- Appointment confirmations
- Appointment reminders (24 hours before)
- Payment receipts
- Appointment cancellations

## 📱 SMS Reminders

Twilio integration sends SMS reminders:
- 24 hours before appointment
- 1 hour before appointment

## 🔄 Cron Jobs

Scheduled tasks run for:
- Appointment reminders
- Email notifications
- Payment reconciliation

## 🛡️ Middleware

- **Authentication Middleware** - Verifies JWT tokens
- **Error Middleware** - Centralized error handling
- **Validation Middleware** - Input validation

## 📝 Scripts

### Server
```bash
npm run dev      # Start with nodemon (development)
npm start        # Start server
npm test         # Run tests
```

### Client
```bash
npm start        # Start development server
npm build        # Build for production
npm test         # Run tests
npm eject        # Eject from CRA (irreversible)
```

## 🐛 Troubleshooting

### Server won't start
- Check database connection credentials
- Verify all required environment variables are set
- Ensure port 5000 is not in use

### Payment errors
- Verify Stripe API keys are correct
- Check webhook secret configuration
- Review Stripe dashboard for failed transactions

### Email not sending
- Enable "Less secure app access" for Gmail
- Use app-specific password (not your main password)
- Check Nodemailer configuration

### SMS not sending
- Verify Twilio credentials
- Ensure phone number format is correct
- Check Twilio account balance

## 📞 Support

For issues or questions, please create an issue in the repository or contact the development team.

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Contributors

- Development team

---

**Last Updated:** December 16, 2025
