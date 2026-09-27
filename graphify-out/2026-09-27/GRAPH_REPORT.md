# Graph Report - OCMS  (2026-09-24)

## Corpus Check
- 99 files · ~62,954 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 8, .mdc 1, .conf 1)

## Summary
- 790 nodes · 1262 edges · 64 communities (45 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50582914`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- authController.js
- sendAuthEmail.js
- app.js
- dashboard.js
- frontend/package.json
- dependencies
- devDependencies
- payments.js
- tripController.js
- optimize-db-indexes.js
- backend/package.json
- What You Must Do When Invoked
- package.json
- geolocationService.js
- ref_mongoose
- 🌿 OCMS - Organic Coffee Management System
- geolocationController.js
- apiCache
- reports.js
- db.js
- vercel.json
- scripts
- graphify reference: extra exports and benchmark
- Install and run Graphify on OCMS
- API Documentation
- User.js
- Key Functionalities
- Screenshots
- graphify reference: query, path, explain
- Tips for Development
- Features
- Database Schema
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- Installation
- Tech Stack
- Configuration
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- User Roles & Permissions
- 📂 Project Structure
- Security
- extraction-spec.md
- eslint.config.js
- DeliveryMap.jsx
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_createdelivery
- tailwind.config.js
- vite.config.js
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_deletedelivery
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_getdeliveries
- Reports
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_utils_sendauthemail_issuepasswordresetlink
- @testing-library/jest-dom
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_getdelivery
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_getdeliverytypesbyfarmer
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_gettotalkgsbytype
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_getunpaiddeliveriesbyfarmer
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_controllers_deliverycontroller_updatedelivery
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_middleware_auth_authorize
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_middleware_auth_verifytoken

## God Nodes (most connected - your core abstractions)
1. `react` - 35 edges
2. `react-router-dom` - 22 edges
3. `lucide-react` - 21 edges
4. `🌿 OCMS - Organic Coffee Management System` - 21 edges
5. `api` - 19 edges
6. `react-hot-toast` - 16 edges
7. `AuthContext` - 13 edges
8. `What You Must Do When Invoked` - 12 edges
9. `useSmartRefresh()` - 11 edges
10. `/graphify` - 10 edges

## Surprising Connections (you probably didn't know these)
- `forgotPassword()` --calls--> `issuePasswordResetLink()`  [EXTRACTED]
  backend/controllers/authController.js → backend/utils/sendAuthEmail.js
- `NearbyFarmers()` --calls--> `useGeolocation()`  [EXTRACTED]
  frontend/src/components/NearbyFarmers.jsx → frontend/src/hooks/useGeolocation.js
- `Reports()` --calls--> `useSmartRefresh()`  [EXTRACTED]
  frontend/src/pages/Reports.jsx → frontend/src/hooks/useSmartRefresh.js
- `DeliveryTrack()` --calls--> `canUpdate()`  [EXTRACTED]
  frontend/src/pages/DeliveryTrack.jsx → frontend/src/utils/permissions.js
- `sendInvite()` --calls--> `issuePasswordResetLink()`  [EXTRACTED]
  backend/controllers/userController.js → backend/utils/sendAuthEmail.js

## Import Cycles
- None detected.

## Communities (64 total, 19 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.06
Nodes (66): App(), AuthTogglePage, Dashboard, Deliveries, DeliveryTrack, EditDelivery, Farmers, ForgotPassword (+58 more)

### Community 1 - "authController.js"
Cohesion: 0.06
Nodes (41): bcrypt, changePassword(), createSession(), crypto, deleteSession(), escapeRegex(), findUserByIdentifier(), forgotPassword() (+33 more)

### Community 2 - "sendAuthEmail.js"
Cohesion: 0.10
Nodes (33): bcrypt, createFieldAgent(), crypto, deleteUser(), getUsers(), { issuePasswordResetLink }, publicUser(), resendInvite() (+25 more)

### Community 3 - "app.js"
Cohesion: 0.10
Nodes (20): app, bootstrapAdmin, connectDB, allowedOrigins, app, compression, cors, dashboardRoutes (+12 more)

### Community 4 - "dashboard.js"
Cohesion: 0.15
Nodes (11): farmerSchema, mongoose, dashboardReadLimiter, Delivery, Farmer, Payment, PENDING_STATUS, rateLimit (+3 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.08
Nodes (23): jsonwebtoken, name, private, type, version, autoprefixer, axios, bootstrap (+15 more)

### Community 6 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, axios, bootstrap, chart.js, date-fns, @hookform/resolvers, jsonwebtoken, jspdf (+15 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, daisyui, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 8 - "payments.js"
Cohesion: 0.18
Nodes (14): createPayment(), deletePayment(), Farmer, getPayments(), Payment, retryPayment(), updatePayment(), User (+6 more)

### Community 9 - "tripController.js"
Cohesion: 0.07
Nodes (40): createDelivery(), deleteDelivery(), Delivery, getDeliveries(), getDelivery(), getDeliveryTypesByFarmer(), getTotalKgsByType(), Trip (+32 more)

### Community 10 - "optimize-db-indexes.js"
Cohesion: 0.15
Nodes (10): mongoose, sessionSchema, Delivery, dotenv, Farmer, mongoose, PasswordReset, Payment (+2 more)

### Community 11 - "backend/package.json"
Cohesion: 0.05
Nodes (42): author, dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit (+34 more)

### Community 12 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 13 - "package.json"
Cohesion: 0.05
Nodes (42): author, dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit (+34 more)

### Community 14 - "geolocationService.js"
Cohesion: 0.19
Nodes (3): GeolocationCapture(), NearbyFarmers(), useGeolocation()

### Community 15 - "ref_mongoose"
Cohesion: 0.29
Nodes (6): getUnpaidDeliveriesByFarmer(), mongoose, passwordResetSchema, mongoose, paymentSchema, ref_mongoose

### Community 16 - "🌿 OCMS - Organic Coffee Management System"
Cohesion: 0.15
Nodes (12): Acknowledgments, Author, Environment Variables, License, 🌿 OCMS - Organic Coffee Management System, Prerequisites, Required Backend Variables, Required Frontend Variables (+4 more)

### Community 17 - "geolocationController.js"
Cohesion: 0.13
Nodes (18): calculateDistanceBetweenPoints(), Delivery, Farmer, geo, getNearbyFarmers(), getNearestDeliveries(), recordDropoffLocation(), recordPickupLocation() (+10 more)

### Community 18 - "apiCache"
Cohesion: 0.22
Nodes (3): apiCache, cachedFetch(), invalidateCache()

### Community 19 - "reports.js"
Cohesion: 0.06
Nodes (46): createDriver(), Driver, getDrivers(), { validationResult }, createFarmer(), deleteFarmer(), Farmer, getFarmer() (+38 more)

### Community 20 - "db.js"
Cohesion: 0.31
Nodes (7): connectDB(), ensureCriticalIndexes(), mongoose, sanitizeUri(), withTimeout(), mongoose, tripPingSchema

### Community 21 - "vercel.json"
Cohesion: 0.22
Nodes (8): maxDuration, buildCommand, functions, api/index.js, installCommand, outputDirectory, rewrites, $schema

### Community 22 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, preview, start, test, test:e2e

### Community 23 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 24 - "Install and run Graphify on OCMS"
Cohesion: 0.22
Nodes (8): 1. Prerequisites (once on this PC), 2. Install the CLI, 3. Project-scoped assistant wiring (this repo), 4. Ignore generated noise, 5. Build the graph (code-only, offline), 6. Run / use it, 7. What we will change in git (when you approve execution), Install and run Graphify on OCMS

### Community 25 - "API Documentation"
Cohesion: 0.22
Nodes (9): API Documentation, Authentication Endpoints, Dashboard Endpoints, Delivery Endpoints, Farmer Endpoints, Payment Endpoints, Query Parameters for Filtering, Report Endpoints (Admin Only) (+1 more)

### Community 26 - "User.js"
Cohesion: 0.14
Nodes (10): bcrypt, dotenv, Farmer, mongoose, path, User, mongoose, userSchema (+2 more)

### Community 27 - "Key Functionalities"
Cohesion: 0.25
Nodes (8): 1. Dashboard with Real-Time Analytics, 2. Farmer Management, 3. Delivery Tracking, 4. Payment Processing, 5. Advanced Reports & Analytics, 6. Notification System, 7. User Settings, Key Functionalities

### Community 28 - "Screenshots"
Cohesion: 0.29
Nodes (7): Analytics Reports, Dark Mode, Dashboard, Delivery Tracking, Farmer Management, Payment Processing, Screenshots

### Community 29 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 30 - "Tips for Development"
Cohesion: 0.40
Nodes (5): Check MongoDB Connection, Common Commands, Quick Start Development, Seed Sample Data, Tips for Development

### Community 31 - "Features"
Cohesion: 0.40
Nodes (5): Core Functionality, Features, Technical Features, UI/UX Features, User Management

### Community 32 - "Database Schema"
Cohesion: 0.40
Nodes (5): Database Schema, Delivery Schema, Farmer Schema, Payment Schema, User Schema

### Community 33 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 34 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 35 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

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

### Community 47 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): ref_eslint_config, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 48 - "DeliveryMap.jsx"
Cohesion: 0.33
Nodes (5): DefaultIcon, DeliveryMap(), TruckIcon, leaflet, ref_leaflet_dist_leaflet_css

### Community 54 - "Reports"
Cohesion: 0.40
Nodes (3): Reports(), fetchAllData(), processData()

## Knowledge Gaps
- **399 isolated node(s):** `app`, `connectDB`, `bootstrapAdmin`, `express`, `cors` (+394 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 471 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `DeliveryMap.jsx`, `frontend/package.json`, `geolocationService.js`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `app`, `connectDB`, `bootstrapAdmin` to the rest of the system?**
  _399 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056978730010867874 - nodes in this community are weakly interconnected._
- **Should `authController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06363636363636363 - nodes in this community are weakly interconnected._
- **Should `sendAuthEmail.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10317460317460317 - nodes in this community are weakly interconnected._