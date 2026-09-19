# Graph Report - OCMS  (2026-09-19)

## Corpus Check
- 88 files · ~58,109 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 8, .mdc 1, .conf 1)

## Summary
- 636 nodes · 1051 edges · 42 communities (40 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc40d5e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- authController.js
- sendAuthEmail.js
- app.js
- geolocationController.js
- frontend/package.json
- dependencies
- devDependencies
- payments.js
- reports.js
- optimize-db-indexes.js
- backend/package.json
- deliveries.js
- package.json
- geolocationService.js
- dependencies
- dependencies
- seed.js
- APICache
- 🌿 OCMS - Organic Coffee Management System
- API Documentation
- vercel.json
- ref_mongoose
- Key Functionalities
- Screenshots
- Reports
- Tips for Development
- scripts
- scripts
- overrides
- Features
- Database Schema
- engines
- overrides
- Installation
- Tech Stack
- Configuration
- User Roles & Permissions
- 📂 Project Structure
- Security
- devDependencies

## God Nodes (most connected - your core abstractions)
1. `react` - 31 edges
2. `🌿 OCMS - Organic Coffee Management System` - 21 edges
3. `react-router-dom` - 20 edges
4. `lucide-react` - 18 edges
5. `api` - 14 edges
6. `react-hot-toast` - 13 edges
7. `AuthContext` - 12 edges
8. `useSmartRefresh()` - 11 edges
9. `API Documentation` - 9 edges
10. `issuePasswordResetLink()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `forgotPassword()` --calls--> `issuePasswordResetLink()`  [EXTRACTED]
  backend/controllers/authController.js → backend/utils/sendAuthEmail.js
- `Users()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/pages/Users.jsx → frontend/src/context/AuthContext.jsx
- `Reports()` --calls--> `useSmartRefresh()`  [EXTRACTED]
  frontend/src/pages/Reports.jsx → frontend/src/hooks/useSmartRefresh.js
- `NearbyFarmers()` --calls--> `useGeolocation()`  [EXTRACTED]
  frontend/src/components/NearbyFarmers.jsx → frontend/src/hooks/useGeolocation.js
- `sendInvite()` --calls--> `issuePasswordResetLink()`  [EXTRACTED]
  backend/controllers/userController.js → backend/utils/sendAuthEmail.js

## Import Cycles
- None detected.

## Communities (42 total, 2 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.06
Nodes (58): App(), AuthTogglePage, Dashboard, Deliveries, EditDelivery, Farmers, ForgotPassword, LandingPage (+50 more)

### Community 1 - "authController.js"
Cohesion: 0.06
Nodes (38): bcrypt, changePassword(), createSession(), crypto, deleteSession(), forgotPassword(), getDeviceInfo(), getSessions() (+30 more)

### Community 2 - "sendAuthEmail.js"
Cohesion: 0.10
Nodes (32): bcrypt, createFieldAgent(), crypto, deleteUser(), getUsers(), { issuePasswordResetLink }, publicUser(), resendInvite() (+24 more)

### Community 3 - "app.js"
Cohesion: 0.06
Nodes (34): app, bootstrapAdmin, connectDB, allowedOrigins, app, compression, cors, dashboardRoutes (+26 more)

### Community 4 - "geolocationController.js"
Cohesion: 0.13
Nodes (18): calculateDistanceBetweenPoints(), Delivery, Farmer, geo, getNearbyFarmers(), getNearestDeliveries(), recordDropoffLocation(), recordPickupLocation() (+10 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.04
Nodes (43): name, private, scripts, build, dev, lint, preview, start (+35 more)

### Community 6 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, axios, bootstrap, chart.js, date-fns, @hookform/resolvers, jsonwebtoken, jspdf (+15 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, daisyui, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 8 - "payments.js"
Cohesion: 0.17
Nodes (15): createPayment(), deletePayment(), Farmer, getPayments(), Payment, retryPayment(), updatePayment(), User (+7 more)

### Community 9 - "reports.js"
Cohesion: 0.08
Nodes (35): createFarmer(), deleteFarmer(), Farmer, getFarmer(), getFarmers(), searchFarmers(), updateFarmer(), User (+27 more)

### Community 10 - "optimize-db-indexes.js"
Cohesion: 0.12
Nodes (12): mongoose, passwordResetSchema, mongoose, sessionSchema, Delivery, dotenv, Farmer, mongoose (+4 more)

### Community 11 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, description, cors, express, mongoose, keywords, license, main (+7 more)

### Community 12 - "deliveries.js"
Cohesion: 0.21
Nodes (13): createDelivery(), deleteDelivery(), Delivery, getDeliveries(), getDelivery(), getDeliveryTypesByFarmer(), getTotalKgsByType(), updateDelivery() (+5 more)

### Community 13 - "package.json"
Cohesion: 0.13
Nodes (14): author, description, bcryptjs, compression, cors, dotenv, express, express-rate-limit (+6 more)

### Community 14 - "geolocationService.js"
Cohesion: 0.19
Nodes (3): GeolocationCapture(), NearbyFarmers(), useGeolocation()

### Community 15 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit, express-validator (+5 more)

### Community 16 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit, express-validator (+5 more)

### Community 17 - "seed.js"
Cohesion: 0.14
Nodes (10): bcrypt, dotenv, Farmer, mongoose, path, User, mongoose, userSchema (+2 more)

### Community 18 - "APICache"
Cohesion: 0.22
Nodes (3): APICache, cachedFetch(), invalidateCache()

### Community 19 - "🌿 OCMS - Organic Coffee Management System"
Cohesion: 0.15
Nodes (12): Acknowledgments, Author, Environment Variables, License, 🌿 OCMS - Organic Coffee Management System, Prerequisites, Required Backend Variables, Required Frontend Variables (+4 more)

### Community 20 - "API Documentation"
Cohesion: 0.22
Nodes (9): API Documentation, Authentication Endpoints, Dashboard Endpoints, Delivery Endpoints, Farmer Endpoints, Payment Endpoints, Query Parameters for Filtering, Report Endpoints (Admin Only) (+1 more)

### Community 21 - "vercel.json"
Cohesion: 0.22
Nodes (8): maxDuration, buildCommand, functions, api/index.js, installCommand, outputDirectory, rewrites, $schema

### Community 22 - "ref_mongoose"
Cohesion: 0.29
Nodes (6): getUnpaidDeliveriesByFarmer(), farmerSchema, mongoose, mongoose, paymentSchema, ref_mongoose

### Community 23 - "Key Functionalities"
Cohesion: 0.25
Nodes (8): 1. Dashboard with Real-Time Analytics, 2. Farmer Management, 3. Delivery Tracking, 4. Payment Processing, 5. Advanced Reports & Analytics, 6. Notification System, 7. User Settings, Key Functionalities

### Community 24 - "Screenshots"
Cohesion: 0.29
Nodes (7): Analytics Reports, Dark Mode, Dashboard, Delivery Tracking, Farmer Management, Payment Processing, Screenshots

### Community 25 - "Reports"
Cohesion: 0.40
Nodes (3): Reports(), fetchAllData(), processData()

### Community 26 - "Tips for Development"
Cohesion: 0.40
Nodes (5): Check MongoDB Connection, Common Commands, Quick Start Development, Seed Sample Data, Tips for Development

### Community 27 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, build:backend, build:frontend, start

### Community 28 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 29 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, fast-xml-parser, path-to-regexp

### Community 30 - "Features"
Cohesion: 0.40
Nodes (5): Core Functionality, Features, Technical Features, UI/UX Features, User Management

### Community 31 - "Database Schema"
Cohesion: 0.40
Nodes (5): Database Schema, Delivery Schema, Farmer Schema, Payment Schema, User Schema

### Community 32 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, npm

### Community 33 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, fast-xml-parser, path-to-regexp

### Community 34 - "Installation"
Cohesion: 0.50
Nodes (4): 1. Clone the Repository, 2. Install Backend Dependencies, 3. Install Frontend Dependencies, Installation

### Community 35 - "Tech Stack"
Cohesion: 0.50
Nodes (4): Backend, Development Tools, Frontend, Tech Stack

### Community 37 - "Configuration"
Cohesion: 0.50
Nodes (4): Backend Configuration, Configuration, Frontend Configuration, Option 2: Using Concurrent Scripts (Recommended)

### Community 38 - "User Roles & Permissions"
Cohesion: 0.67
Nodes (3): Admin, Field Agent, User Roles & Permissions

### Community 39 - "📂 Project Structure"
Cohesion: 0.67
Nodes (3): Backend Structure, Frontend Structure, 📂 Project Structure

### Community 40 - "Security"
Cohesion: 0.67
Nodes (3): Reporting Security Issues, Security, Security Features

## Knowledge Gaps
- **306 isolated node(s):** `Table of Contents`, `Core Functionality`, `User Management`, `UI/UX Features`, `Technical Features` (+301 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 359 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jsonwebtoken` connect `backend/package.json` to `package.json`, `frontend/package.json`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `react` connect `App.jsx` to `frontend/package.json`, `geolocationService.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `Table of Contents`, `Core Functionality`, `User Management` to the rest of the system?**
  _306 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06015610127546164 - nodes in this community are weakly interconnected._
- **Should `authController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._
- **Should `sendAuthEmail.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10084033613445378 - nodes in this community are weakly interconnected._