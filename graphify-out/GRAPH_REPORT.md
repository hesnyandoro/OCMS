# Graph Report - workspace  (2026-11-22)

## Corpus Check
- 107 files · ~60,371 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 9, .conf 1, .css 1)

## Summary
- 804 nodes · 1534 edges · 45 communities (39 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `51a29eaf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- authController.js
- sendAuthEmail.js
- app.js
- reports.js
- frontend/package.json
- dependencies
- eslint.config.js
- ref_mongoose
- tripController.js
- optimize-db-indexes.js
- backend/package.json
- with
- package.json
- FarmLocationPicker.jsx
- Reports.jsx
- 🌿 OCMS - Organic Coffee Management System
- utils/geolocation.js
- apiCache
- farmerController.js
- db.js
- vercel.json
- seed.js
- backend
- Install and run Graphify on OCMS
- API Documentation
- backend
- Key Functionalities
- Screenshots
- scripts
- Tips for Development
- Features
- Database Schema
- vite
- daisyui
- Installation
- Tech Stack
- Configuration
- User Roles & Permissions
- 📂 Project Structure
- Security

## God Nodes (most connected - your core abstractions)
1. `react` - 42 edges
2. `react-router-dom` - 25 edges
3. `lucide-react` - 24 edges
4. `App()` - 23 edges
5. `react-hot-toast` - 21 edges
6. `🌿 OCMS - Organic Coffee Management System` - 21 edges
7. `api` - 20 edges
8. `AuthContext` - 15 edges
9. `Deliveries()` - 14 edges
10. `useSmartRefresh()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `forgotPassword()` --calls--> `issuePasswordResetLink()`  [EXTRACTED]
  backend/controllers/authController.js → backend/utils/sendAuthEmail.js
- `buildFarmerPayload()` --calls--> `normalizeFarmLocation()`  [EXTRACTED]
  backend/controllers/farmerController.js → backend/utils/geolocation.js
- `sendInvite()` --calls--> `issuePasswordResetLink()`  [EXTRACTED]
  backend/controllers/userController.js → backend/utils/sendAuthEmail.js
- `FarmerForm()` --calls--> `FarmLocationPicker()`  [EXTRACTED]
  frontend/src/components/FarmerForm.jsx → frontend/src/components/FarmLocationPicker.jsx
- `Harness()` --calls--> `FarmLocationPicker()`  [EXTRACTED]
  frontend/src/components/FarmLocationPicker.test.jsx → frontend/src/components/FarmLocationPicker.jsx

## Import Cycles
- None detected.

## Communities (45 total, 6 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.06
Nodes (73): App(), AuthTogglePage, Dashboard, Deliveries, DeliveryTrack, EditDelivery, FarmerMap, Farmers (+65 more)

### Community 1 - "authController.js"
Cohesion: 0.09
Nodes (28): bcrypt, changePassword(), createSession(), crypto, deleteSession(), escapeRegex(), findUserByIdentifier(), forgotPassword() (+20 more)

### Community 2 - "sendAuthEmail.js"
Cohesion: 0.24
Nodes (15): actionButton(), createEmailTransporter(), createPasswordToken(), crypto, fromAddress(), frontendBaseUrl(), isEmailConfigured(), issuePasswordResetLink() (+7 more)

### Community 3 - "app.js"
Cohesion: 0.14
Nodes (10): allowedOrigins, compression, cors, dotenv, express, dashboardReadLimiter, PENDING_STATUS, rateLimit (+2 more)

### Community 4 - "reports.js"
Cohesion: 0.09
Nodes (34): createDriver(), getDrivers(), { validationResult }, dateQuery(), generateReport(), getCashflowForecast(), getComparativeAnalytics(), getDeliveriesReport() (+26 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.11
Nodes (23): devDependencies, autoprefixer@^10.4.22, jsdom@^26.0.0, @playwright/test@^1.48.2, postcss@^8.5.14, tailwindcss@^3.4.18, @testing-library/jest-dom@^6.6.3, @testing-library/react@^16.0.1 (+15 more)

### Community 6 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, axios@^1.16.0, bootstrap@^5.3.8, @hookform/resolvers@^5.2.2, jsonwebtoken@^9.0.2, jspdf-autotable@^5.0.7, lucide-react@^0.554.0, react@^19.1.1 (+16 more)

### Community 7 - "eslint.config.js"
Cohesion: 0.18
Nodes (10): eslint@^9.36.0, @eslint/js@^9.36.0, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.22, globals@^16.4.0, eslint, @eslint/js, eslint-plugin-react-hooks (+2 more)

### Community 8 - "ref_mongoose"
Cohesion: 0.22
Nodes (11): createPayment(), deletePayment(), getPayments(), retryPayment(), updatePayment(), deliverySchema, mongoose, mongoose (+3 more)

### Community 9 - "tripController.js"
Cohesion: 0.09
Nodes (34): createDelivery(), deleteDelivery(), getDeliveries(), getDelivery(), getDeliveryTypesByFarmer(), getTotalKgsByType(), getUnpaidDeliveriesByFarmer(), updateDelivery() (+26 more)

### Community 10 - "optimize-db-indexes.js"
Cohesion: 0.15
Nodes (8): mongoose, passwordResetSchema, mongoose, sessionSchema, mongoose, userSchema, dotenv, mongoose

### Community 11 - "backend/package.json"
Cohesion: 0.06
Nodes (44): author, dependencies, bcryptjs@^2.4.3, compression@^1.8.1, cors@^2.8.5, dotenv@^16.0.0, express@^4.17.2, express-rate-limit@^8.5.2 (+36 more)

### Community 12 - "with"
Cohesion: 0.06
Nodes (34): name, runs-on, steps, EB_APP, EB_ENV, ECR_REGISTRY, ECR_REPOSITORY, FRONTEND_URL (+26 more)

### Community 13 - "package.json"
Cohesion: 0.06
Nodes (42): author, dependencies, bcryptjs@^2.4.3, compression@^1.8.1, cors@^2.8.5, dotenv@^16.0.0, express@^4.17.2, express-rate-limit@^8.5.2 (+34 more)

### Community 14 - "FarmLocationPicker.jsx"
Cohesion: 0.09
Nodes (21): leaflet@^1.9.4, vitest@^4.1.5, FarmLocationPicker(), geocodeRegion, Harness(), GeolocationCapture(), DefaultIcon, hasCoords() (+13 more)

### Community 15 - "Reports.jsx"
Cohesion: 0.15
Nodes (18): chart.js@^4.4.0, date-fns@^4.1.0, jspdf@^4.2.1, papaparse@^5.5.3, react-chartjs-2@^5.2.0, deliveryPaymentStatus(), localDateParam(), paymentRefId() (+10 more)

### Community 16 - "🌿 OCMS - Organic Coffee Management System"
Cohesion: 0.15
Nodes (12): Acknowledgments, Author, Environment Variables, License, 🌿 OCMS - Organic Coffee Management System, Prerequisites, Required Backend Variables, Required Frontend Variables (+4 more)

### Community 17 - "utils/geolocation.js"
Cohesion: 0.10
Nodes (35): calculateDistanceBetweenPoints(), geocodeRegion(), getNearbyFarmers(), getNearestDeliveries(), mapFarmerForGeo(), recordDropoffLocation(), recordPickupLocation(), validateUserLocation() (+27 more)

### Community 19 - "farmerController.js"
Cohesion: 0.10
Nodes (24): assignedRegionFor(), buildFarmerPayload(), createFarmer(), deleteFarmer(), duplicateFarmerMessage(), FARMER_FIELDS, getFarmer(), getFarmers() (+16 more)

### Community 20 - "db.js"
Cohesion: 0.22
Nodes (11): app, connectDB(), ensureCriticalIndexes(), mongoose, sanitizeUri(), withTimeout(), mongoose, tripPingSchema (+3 more)

### Community 21 - "vercel.json"
Cohesion: 0.22
Nodes (8): maxDuration, buildCommand, functions, api/index.js, installCommand, outputDirectory, rewrites, $schema

### Community 22 - "seed.js"
Cohesion: 0.13
Nodes (8): bcrypt, dotenv, mongoose, path, envPath, mongoose, path, dotenv

### Community 23 - "backend"
Cohesion: 0.12
Nodes (17): build, environment, networks, ports, volumes, context, dockerfile, build (+9 more)

### Community 24 - "Install and run Graphify on OCMS"
Cohesion: 0.22
Nodes (8): 1. Prerequisites (once on this PC), 2. Install the CLI, 3. Project-scoped assistant wiring (this repo), 4. Ignore generated noise, 5. Build the graph (code-only, offline), 6. Run / use it, 7. What we will change in git (when you approve execution), Install and run Graphify on OCMS

### Community 25 - "API Documentation"
Cohesion: 0.22
Nodes (9): API Documentation, Authentication Endpoints, Dashboard Endpoints, Delivery Endpoints, Farmer Endpoints, Payment Endpoints, Query Parameters for Filtering, Report Endpoints (Admin Only) (+1 more)

### Community 26 - "backend"
Cohesion: 0.12
Nodes (16): environment, image, networks, ports, volumes, depends_on, image, networks (+8 more)

### Community 27 - "Key Functionalities"
Cohesion: 0.25
Nodes (8): 1. Dashboard with Real-Time Analytics, 2. Farmer Management, 3. Delivery Tracking, 4. Payment Processing, 5. Advanced Reports & Analytics, 6. Notification System, 7. User Settings, Key Functionalities

### Community 28 - "Screenshots"
Cohesion: 0.29
Nodes (7): Analytics Reports, Dark Mode, Dashboard, Delivery Tracking, Farmer Management, Payment Processing, Screenshots

### Community 29 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, preview, start, test, test:e2e

### Community 30 - "Tips for Development"
Cohesion: 0.40
Nodes (5): Check MongoDB Connection, Common Commands, Quick Start Development, Seed Sample Data, Tips for Development

### Community 31 - "Features"
Cohesion: 0.40
Nodes (5): Core Functionality, Features, Technical Features, UI/UX Features, User Management

### Community 32 - "Database Schema"
Cohesion: 0.40
Nodes (5): Database Schema, Delivery Schema, Farmer Schema, Payment Schema, User Schema

### Community 33 - "vite"
Cohesion: 0.40
Nodes (4): vite@^8.1.0, @vitejs/plugin-react@^5.2.0, vite, @vitejs/plugin-react

### Community 37 - "Installation"
Cohesion: 0.50
Nodes (4): 1. Clone the Repository, 2. Install Backend Dependencies, 3. Install Frontend Dependencies, Installation

### Community 38 - "Tech Stack"
Cohesion: 0.50
Nodes (4): Backend, Development Tools, Frontend, Tech Stack

### Community 39 - "Configuration"
Cohesion: 0.50
Nodes (4): Backend Configuration, Configuration, Frontend Configuration, Option 2: Using Concurrent Scripts (Recommended)

### Community 42 - "User Roles & Permissions"
Cohesion: 0.67
Nodes (3): Admin, Field Agent, User Roles & Permissions

### Community 43 - "📂 Project Structure"
Cohesion: 0.67
Nodes (3): Backend Structure, Frontend Structure, 📂 Project Structure

### Community 44 - "Security"
Cohesion: 0.67
Nodes (3): Reporting Security Issues, Security, Security Features

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supertest` connect `backend/package.json` to `farmerController.js`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05702479338842975 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `Reports.jsx`, `frontend/package.json`, `dependencies`, `FarmLocationPicker.jsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `authController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0928030303030303 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `App.jsx` to `Reports.jsx`, `frontend/package.json`, `dependencies`, `FarmLocationPicker.jsx`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `reports.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08527131782945736 - nodes in this community are weakly interconnected._