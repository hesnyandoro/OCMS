# Graph Report - OCMS  (2026-09-19)

## Corpus Check
- 88 files · ~58,109 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 8, .mdc 1, .conf 1)

## Summary
- 717 nodes · 1116 edges · 55 communities (45 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c56925a`
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
- What You Must Do When Invoked
- deliveries.js
- package.json
- geolocationService.js
- backend/package.json
- dashboard.js
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
- permissions.js
- graphify reference: extra exports and benchmark
- Install and run Graphify on OCMS
- Features
- Database Schema
- scripts
- graphify reference: query, path, explain
- Installation
- Tech Stack
- Configuration
- User Roles & Permissions
- 📂 Project Structure
- Security
- eslint.config.js
- DeliveryMap.jsx
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- tailwind.config.js
- vite.config.js
- extraction-spec.md
- @testing-library/jest-dom
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_middleware_auth_authorize
- c_users_nyandoro_desktop_portfolio_autoscale_ocms_backend_middleware_auth_verifytoken

## God Nodes (most connected - your core abstractions)
1. `react` - 31 edges
2. `🌿 OCMS - Organic Coffee Management System` - 21 edges
3. `react-router-dom` - 20 edges
4. `lucide-react` - 18 edges
5. `api` - 17 edges
6. `react-hot-toast` - 13 edges
7. `AuthContext` - 12 edges
8. `What You Must Do When Invoked` - 12 edges
9. `useSmartRefresh()` - 11 edges
10. `/graphify` - 10 edges

## Surprising Connections (you probably didn't know these)
- `NearbyFarmers()` --calls--> `useGeolocation()`  [EXTRACTED]
  frontend/src/components/NearbyFarmers.jsx → frontend/src/hooks/useGeolocation.js
- `Users()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/pages/Users.jsx → frontend/src/context/AuthContext.jsx
- `Deliveries()` --calls--> `useSmartRefresh()`  [EXTRACTED]
  frontend/src/pages/Deliveries.jsx → frontend/src/hooks/useSmartRefresh.js
- `Farmers()` --calls--> `useSmartRefresh()`  [EXTRACTED]
  frontend/src/pages/Farmers.jsx → frontend/src/hooks/useSmartRefresh.js
- `Reports()` --calls--> `useSmartRefresh()`  [EXTRACTED]
  frontend/src/pages/Reports.jsx → frontend/src/hooks/useSmartRefresh.js

## Import Cycles
- None detected.

## Communities (55 total, 10 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.07
Nodes (52): App(), AuthTogglePage, Dashboard, Deliveries, EditDelivery, Farmers, ForgotPassword, LandingPage (+44 more)

### Community 1 - "authController.js"
Cohesion: 0.06
Nodes (37): bcrypt, changePassword(), createSession(), crypto, deleteSession(), getDeviceInfo(), getSessions(), { issuePasswordResetLink } (+29 more)

### Community 2 - "sendAuthEmail.js"
Cohesion: 0.10
Nodes (32): forgotPassword(), bcrypt, createFieldAgent(), crypto, deleteUser(), getUsers(), { issuePasswordResetLink }, publicUser() (+24 more)

### Community 3 - "app.js"
Cohesion: 0.09
Nodes (25): app, bootstrapAdmin, connectDB, allowedOrigins, app, compression, cors, dashboardRoutes (+17 more)

### Community 4 - "geolocationController.js"
Cohesion: 0.13
Nodes (18): calculateDistanceBetweenPoints(), Delivery, Farmer, geo, getNearbyFarmers(), getNearestDeliveries(), recordDropoffLocation(), recordPickupLocation() (+10 more)

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

### Community 9 - "reports.js"
Cohesion: 0.08
Nodes (35): createFarmer(), deleteFarmer(), Farmer, getFarmer(), getFarmers(), searchFarmers(), updateFarmer(), User (+27 more)

### Community 10 - "optimize-db-indexes.js"
Cohesion: 0.15
Nodes (10): mongoose, passwordResetSchema, Delivery, dotenv, Farmer, mongoose, PasswordReset, Payment (+2 more)

### Community 11 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 12 - "deliveries.js"
Cohesion: 0.21
Nodes (13): createDelivery(), deleteDelivery(), Delivery, getDeliveries(), getDelivery(), getDeliveryTypesByFarmer(), getTotalKgsByType(), updateDelivery() (+5 more)

### Community 13 - "package.json"
Cohesion: 0.05
Nodes (42): author, dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit (+34 more)

### Community 14 - "geolocationService.js"
Cohesion: 0.19
Nodes (3): GeolocationCapture(), NearbyFarmers(), useGeolocation()

### Community 15 - "backend/package.json"
Cohesion: 0.05
Nodes (42): author, dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit (+34 more)

### Community 16 - "dashboard.js"
Cohesion: 0.15
Nodes (11): farmerSchema, mongoose, dashboardReadLimiter, Delivery, Farmer, Payment, PENDING_STATUS, rateLimit (+3 more)

### Community 17 - "seed.js"
Cohesion: 0.14
Nodes (10): bcrypt, dotenv, Farmer, mongoose, path, User, mongoose, userSchema (+2 more)

### Community 18 - "APICache"
Cohesion: 0.22
Nodes (3): apiCache, cachedFetch(), invalidateCache()

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
Nodes (6): getUnpaidDeliveriesByFarmer(), mongoose, paymentSchema, mongoose, sessionSchema, ref_mongoose

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

### Community 27 - "permissions.js"
Cohesion: 0.24
Nodes (8): Deliveries(), Farmers(), canCreate(), canDelete(), canRead(), canUpdate(), hasPermission(), PERMISSIONS

### Community 28 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 29 - "Install and run Graphify on OCMS"
Cohesion: 0.22
Nodes (8): 1. Prerequisites (once on this PC), 2. Install the CLI, 3. Project-scoped assistant wiring (this repo), 4. Ignore generated noise, 5. Build the graph (code-only, offline), 6. Run / use it, 7. What we will change in git (when you approve execution), Install and run Graphify on OCMS

### Community 30 - "Features"
Cohesion: 0.40
Nodes (5): Core Functionality, Features, Technical Features, UI/UX Features, User Management

### Community 31 - "Database Schema"
Cohesion: 0.40
Nodes (5): Database Schema, Delivery Schema, Farmer Schema, Payment Schema, User Schema

### Community 32 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, preview, start, test, test:e2e

### Community 33 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

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

### Community 41 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): ref_eslint_config, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 42 - "DeliveryMap.jsx"
Cohesion: 0.40
Nodes (4): DefaultIcon, DeliveryMap(), leaflet, ref_leaflet_dist_leaflet_css

### Community 43 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 44 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 45 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **373 isolated node(s):** `app`, `connectDB`, `bootstrapAdmin`, `express`, `cors` (+368 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 436 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `DeliveryMap.jsx`, `frontend/package.json`, `geolocationService.js`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `app`, `connectDB`, `bootstrapAdmin` to the rest of the system?**
  _373 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07191011235955057 - nodes in this community are weakly interconnected._
- **Should `authController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06463414634146342 - nodes in this community are weakly interconnected._
- **Should `sendAuthEmail.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10084033613445378 - nodes in this community are weakly interconnected._