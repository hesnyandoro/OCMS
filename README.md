# 🌿 OCMS - Organic Coffee Management System

A comprehensive full-stack web application for managing organic coffee cooperatives, tracking deliveries, processing payments, and generating analytics reports. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.2+-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.17-000000?style=flat&logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Key Functionalities](#-key-functionalities)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- 🧑‍🌾 **Farmer Management** - Register and manage farmer profiles with regional assignments
- 📦 **Delivery Tracking** - Record coffee deliveries (Cherry/Parchment) with weight and driver details
- 💰 **Payment Processing** - Track payment status (Pending, Completed, Failed) with comprehensive records
- 📊 **Analytics Dashboard** - Real-time KPIs, trends, and visual charts
- 🔍 **Advanced Filtering** - Filter data by date, region, driver, and delivery type
- 📈 **Reports & Analytics** - Generate detailed reports with export capabilities (CSV, PDF)

### User Management
- 🔐 **Role-Based Access Control (RBAC)** - Admin and Field Agent roles
- 👥 **Multi-User Support** - Session management with device tracking
- 🔑 **Secure Authentication** - JWT-based auth with password reset functionality
- 🌍 **Region-Based Filtering** - Field agents see only their assigned regions

### UI/UX Features
- 🌙 **Dark Mode** - System-wide dark theme support
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🔔 **Real-Time Notifications** - Live updates for deliveries, payments, and farmer registrations
- 📅 **Date Pickers** - Enhanced date selection across all forms
- 🎨 **Modern Interface** - Clean, intuitive dashboard with gradient effects
- ⚡ **Auto-Apply Filters** - Instant data refresh on filter changes

### Technical Features
- 🔄 **RESTful API** - Well-structured backend with Express.js
- 🗄️ **MongoDB Integration** - Efficient data storage with Mongoose ODM
- 📧 **Email System** - Nodemailer integration for notifications and password resets
- 🖼️ **File Uploads** - Multer for handling avatar uploads
- 🔒 **Security** - bcrypt password hashing, JWT tokens, CORS protection
- 📊 **Data Visualization** - Chart.js integration for analytics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI Framework |
| React Router | 7.9.5 | Client-side routing |
| Vite | 7.1.7 | Build tool & dev server |
| Tailwind CSS | 3.4.18 | Styling framework |
| Chart.js | 4.4.0 | Data visualization |
| React Hook Form | 7.66.0 | Form management |
| Axios | 1.13.2 | HTTP client |
| React DatePicker | 8.9.0 | Date selection |
| Lucide React | 0.554.0 | Icon library |
| React Hot Toast | 2.6.0 | Notifications |
| jsPDF | 3.0.4 | PDF generation |
| PapaParse | 5.5.3 | CSV parsing |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.17.2 | Web framework |
| MongoDB | 6.2+ | Database |
| Mongoose | 6.2.1 | ODM for MongoDB |
| JWT | 8.5.1 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Nodemailer | 7.0.10 | Email service |
| Multer | 2.0.2 | File uploads |
| express-validator | 6.14.0 | Input validation |

### Development Tools
- **Nodemon** - Auto-restart server on changes
- **ESLint** - Code linting
- **Playwright** - E2E testing
- **Vitest** - Unit testing

---

## 🏗️ System Architecture

```
OCMS/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context (Auth, Theme)
│   │   ├── services/        # API service layer
│   │   └── utils/           # Helper functions & permissions
│   └── public/              # Static assets
│
├── backend/                  # Express.js API
│   ├── config/              # Database configuration
│   ├── controllers/         # Business logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth & validation middleware
│   └── uploads/             # File storage
│
└── docs/                     # Documentation files
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0
- **Git** (for cloning the repository)

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/hesnyandoro/OCMS.git
cd OCMS
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/ocms

# JWT Secret (use a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Option 2: Using Concurrent Scripts (Recommended)

From the root directory, you can set up concurrent runs (requires installing `concurrently`):

```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

---

## 🔐 User Roles & Permissions

### Admin
**Full system access with all privileges:**
- ✅ View, create, update, and delete farmers
- ✅ View, create, update, and delete deliveries
- ✅ View, create, update, and delete payments
- ✅ Access all analytics and reports
- ✅ Manage users (create field agents, assign regions)
- ✅ View all regions and data
- ✅ Export data to CSV/PDF

### Field Agent
**Limited access based on assigned region:**
- ✅ View and create farmers (own region only)
- ✅ View and create deliveries (own region only)
- ✅ View payment status (own region only)
- ❌ Cannot update/delete records
- ❌ Cannot access reports
- ❌ Cannot manage users
- ❌ Cannot create payments

---

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
GET    /api/auth/me                - Get current user
POST   /api/auth/logout            - Logout current session
POST   /api/auth/logout-all        - Logout all sessions
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
PUT    /api/auth/profile           - Update user profile
POST   /api/auth/avatar            - Upload profile picture
```

### Farmer Endpoints
```
GET    /api/farmers                - Get all farmers (filtered by region for field agents)
GET    /api/farmers/search         - Search farmers (for dropdown)
GET    /api/farmers/:id            - Get single farmer
POST   /api/farmers                - Create new farmer
PUT    /api/farmers/:id            - Update farmer (admin only)
DELETE /api/farmers/:id            - Delete farmer (admin only)
```

### Delivery Endpoints
```
GET    /api/deliveries             - Get all deliveries (filtered by region)
GET    /api/deliveries/:id         - Get single delivery
POST   /api/deliveries             - Create new delivery
PUT    /api/deliveries/:id         - Update delivery (admin only)
DELETE /api/deliveries/:id         - Delete delivery (admin only)
```

### Payment Endpoints
```
GET    /api/payments               - Get all payments (filtered by region)
GET    /api/payments/:id           - Get single payment
POST   /api/payments               - Create new payment (admin only)
PUT    /api/payments/:id           - Update payment (admin only)
DELETE /api/payments/:id           - Delete payment (admin only)
```

### Dashboard Endpoints
```
GET    /api/dashboard/summary      - Get dashboard metrics (supports filters)
GET    /api/dashboard/drivers      - Get unique driver list
GET    /api/dashboard/regions      - Get unique region list
```

### Report Endpoints (Admin Only)
```
GET    /api/reports/farmer-performance      - Farmer performance analytics
GET    /api/reports/payment-status          - Payment status summary
GET    /api/reports/delivery-type-analytics - Delivery type breakdown
GET    /api/reports/regional-profitability  - Regional profitability report
GET    /api/reports/operational-metrics     - Operational metrics
```

### User Management Endpoints (Admin Only)
```
GET    /api/users                  - Get all users
POST   /api/users/field-agent      - Create field agent
PUT    /api/users/:id              - Update user
DELETE /api/users/:id              - Delete user
```

### Query Parameters for Filtering

Most endpoints support filtering:
```
?region=Western           - Filter by region
?driver=John%20Doe        - Filter by driver
?type=Cherry              - Filter by delivery type
?date=2025-11-27          - Filter by date
?limit=10                 - Limit results
```

---

## 📂 Project Structure

### Frontend Structure
```
frontend/src/
├── components/
│   ├── Header.jsx              # Top navigation with notifications
│   ├── Sidebar.jsx             # Side navigation menu
│   ├── Layout.jsx              # Main layout wrapper
│   ├── Login.jsx               # Login form component
│   ├── PrivateRoute.jsx        # Protected route wrapper
│   └── FarmerForm.jsx          # Reusable farmer form
│
├── pages/
│   ├── Dashboard.jsx           # Main dashboard with KPIs & charts
│   ├── Farmers.jsx             # Farmer list & management
│   ├── NewFarmer.jsx           # Create new farmer
│   ├── Deliveries.jsx          # Delivery list & management
│   ├── NewDelivery.jsx         # Record new delivery
│   ├── EditDelivery.jsx        # Edit delivery
│   ├── Payments.jsx            # Payment list & management
│   ├── NewPayment.jsx          # Create new payment
│   ├── Reports.jsx             # Analytics & reports
│   ├── Users.jsx               # User management (admin)
│   ├── UserSettings.jsx        # User profile & settings
│   ├── LandingPage.jsx         # Public landing page
│   ├── ForgotPassword.jsx      # Password reset request
│   └── ResetPassword.jsx       # Password reset confirmation
│
├── context/
│   ├── AuthContext.jsx         # Authentication state management
│   └── ThemeContext.jsx        # Dark mode state management
│
├── services/
│   └── api.js                  # Axios instance with interceptors
│
├── utils/
│   └── permissions.js          # RBAC utility functions
│
└── __tests__/                  # Unit & integration tests
```

### Backend Structure
```
backend/
├── config/
│   ├── db.js                   # MongoDB connection
│   └── seed.js                 # Database seeding script
│
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── userController.js       # User management
│   ├── farmerController.js     # Farmer CRUD operations
│   ├── deliveryController.js   # Delivery CRUD operations
│   ├── paymentController.js    # Payment CRUD operations
│   └── reportController.js     # Analytics & reports
│
├── models/
│   ├── User.js                 # User schema
│   ├── Farmer.js               # Farmer schema
│   ├── Delivery.js             # Delivery schema
│   ├── Payment.js              # Payment schema
│   ├── Session.js              # Session schema
│   └── PasswordReset.js        # Password reset token schema
│
├── routes/
│   ├── auth.js                 # Authentication routes
│   ├── users.js                # User management routes
│   ├── farmers.js              # Farmer routes
│   ├── deliveries.js           # Delivery routes
│   ├── payments.js             # Payment routes
│   ├── dashboard.js            # Dashboard routes
│   └── reports.js              # Report routes
│
├── middleware/
│   └── auth.js                 # JWT verification & RBAC
│
└── uploads/                    # File storage directory
    └── avatars/                # User profile pictures
```

---

## 🎯 Key Functionalities

### 1. Dashboard with Real-Time Analytics
- **KPI Cards**: Total farmers, kgs delivered, total paid out, pending actions
- **Charts**: Monthly delivery trends, payment status distribution
- **Recent Activities**: Latest deliveries and payments
- **Smart Filtering**: Auto-apply filters by date, region, driver, type
- **Trend Indicators**: Visual indicators for performance trends

### 2. Farmer Management
- Create, read, update, delete farmer profiles
- Search functionality with live filtering
- Region-based access control
- Export farmer data to CSV/PDF
- Profile pictures/avatars support

### 3. Delivery Tracking
- Record deliveries with weight, type (Cherry/Parchment), driver
- Link deliveries to farmers
- Region and date tracking
- Payment status integration
- Bulk operations and exports

### 4. Payment Processing
- Create payment records linked to deliveries
- Track payment status (Pending, Completed, Failed)
- Calculate pending vs completed amounts
- Payment history and audit trail
- Export payment reports

### 5. Advanced Reports & Analytics
- Farmer performance metrics
- Payment status summary
- Delivery type analytics
- Regional profitability analysis
- Operational metrics dashboard
- CSV and PDF export capabilities

### 6. Notification System
- Real-time notifications for:
  - New deliveries recorded
  - Payment status changes
  - New farmer registrations
- Click to navigate to related records
- Mark as read functionality
- Auto-refresh every 2 minutes

### 7. User Settings
- Profile management
- Password change
- Theme preferences (dark/light mode)
- Session management
- Device tracking
- Logout from all devices

---

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm run test              # Unit tests with Vitest
npm run test:e2e          # E2E tests with Playwright
```

### Run Backend Tests
```bash
cd backend
npm test
```

### Test Coverage
- Unit tests for components
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Real-time KPIs, charts, and recent activities with filtering capabilities*

### Farmer Management
![Farmers](docs/screenshots/farmers.png)
*Comprehensive farmer list with search and export features*

### Delivery Tracking
![Deliveries](docs/screenshots/deliveries.png)
*Track all deliveries with detailed information*

### Payment Processing
![Payments](docs/screenshots/payments.png)
*Manage payments with status tracking*

### Analytics Reports
![Reports](docs/screenshots/reports.png)
*Advanced analytics with multiple chart types*

### Dark Mode
![Dark Mode](docs/screenshots/dark-mode.png)
*Full dark theme support across the application*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style Guidelines
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**hesnyandoro**
- GitHub: [@hesnyandoro](https://github.com/hesnyandoro)

---

## 🙏 Acknowledgments

- Coffee farmers and cooperatives for inspiring this project
- Open source community for amazing tools and libraries
- Contributors and testers who helped improve the system

---

## 📞 Support

For issues, questions, or feature requests:
- 📧 Open an issue on GitHub
- 💬 Contact via email: [bonfacenyandoro3@gmail.com]
- 📚 Check the [documentation](docs/)

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile application (React Native)
- [ ] Barcode/QR code scanning for deliveries
- [ ] SMS notifications integration
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] Weather integration for harvest predictions
- [ ] Blockchain integration for traceability
- [ ] AI-powered analytics and forecasting

---

## 🔒 Security

### Reporting Security Issues
If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Session management with device tracking
- CORS protection
- Input validation and sanitization
- SQL injection prevention (NoSQL)
- XSS protection

---

## 📊 Database Schema

### User Schema
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (admin/fieldagent),
  assignedRegion: String,
  avatar: String
}
```

### Farmer Schema
```javascript
{
  name: String,
  phoneNumber: String,
  region: String,
  coffeeType: String,
  createdBy: ObjectId (User)
}
```

### Delivery Schema
```javascript
{
  farmer: ObjectId (Farmer),
  date: Date,
  type: String (Cherry/Parchment),
  kgsDelivered: Number,
  region: String,
  driver: String,
  paymentStatus: String,
  createdBy: ObjectId (User)
}
```

### Payment Schema
```javascript
{
  farmer: ObjectId (Farmer),
  date: Date,
  amountPaid: Number,
  status: String (Pending/Completed/Failed),
  notes: String,
  createdBy: ObjectId (User)
}
```

---

## 🌍 Environment Variables

### Required Backend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/ocms` |
| `JWT_SECRET` | Secret for JWT signing | `your_secret_key` |
| `EMAIL_USER` | Email for notifications | `your_email@gmail.com` |
| `EMAIL_PASS` | Email password/app password | `your_app_password` |

### Required Frontend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 💡 Tips for Development

### Quick Start Development
```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Seed Sample Data
```bash
cd backend
node config/seed.js
```

### Check MongoDB Connection
```bash
node backend/nodeTestDB.js
```

### Common Commands
```bash
# Backend
npm run start      # Production mode
npm run dev        # Development mode with nodemon

# Frontend
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 🎓 Learning Resources

### For Beginners
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB University](https://university.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### For Advanced Users
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [MongoDB Aggregation](https://www.mongodb.com/docs/manual/aggregation/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

---

**Made with ☕ and ❤️ for the coffee community**

⭐ **Star this repository if you find it helpful!** ⭐
