# Graph Report - OCMS  (2026-09-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 538 nodes · 933 edges · 37 communities (32 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e1cb166b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- authController.js
- reports.js
- app.js
- geolocationController.js
- frontend/package.json
- dependencies
- devDependencies
- payments.js
- farmers.js
- optimize-db-indexes.js
- backend/package.json
- deliveries.js
- package.json
- geolocationService.js
- dependencies
- dependencies
- Farmer.js
- APICache
- dashboard.js
- permissions.js
- vercel.json
- ref_mongoose
- scripts
- eslint.config.js
- Reports
- DeliveryMap.jsx
- scripts
- scripts
- overrides
- tailwind.config.js
- vite.config.js
- engines
- overrides
- devDependencies
- @testing-library/jest-dom

## God Nodes (most connected - your core abstractions)
1. `react` - 31 edges
2. `react-router-dom` - 20 edges
3. `api` - 18 edges
4. `lucide-react` - 18 edges
5. `AuthContext` - 12 edges
6. `react-hot-toast` - 12 edges
7. `useSmartRefresh()` - 11 edges
8. `useAuth()` - 9 edges
9. `APICache` - 8 edges
10. `canCreate()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Users()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/pages/Users.jsx → frontend/src/context/AuthContext.jsx
- `Reports()` --calls--> `useSmartRefresh()`  [EXTRACTED]
  frontend/src/pages/Reports.jsx → frontend/src/hooks/useSmartRefresh.js
- `Deliveries()` --calls--> `canUpdate()`  [EXTRACTED]
  frontend/src/pages/Deliveries.jsx → frontend/src/utils/permissions.js
- `NearbyFarmers()` --calls--> `useGeolocation()`  [EXTRACTED]
  frontend/src/components/NearbyFarmers.jsx → frontend/src/hooks/useGeolocation.js
- `Header()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/components/Header.jsx → frontend/src/context/AuthContext.jsx

## Import Cycles
- None detected.

## Communities (37 total, 5 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.07
Nodes (56): App(), AuthTogglePage, Dashboard, Deliveries, EditDelivery, Farmers, ForgotPassword, LandingPage (+48 more)

### Community 1 - "authController.js"
Cohesion: 0.06
Nodes (42): bcrypt, changePassword(), createEmailTransporter(), createSession(), crypto, deleteSession(), forgotPassword(), getDeviceInfo() (+34 more)

### Community 2 - "reports.js"
Cohesion: 0.08
Nodes (32): Delivery, Farmer, generateReport(), getCashflowForecast(), getComparativeAnalytics(), getDeliveriesReport(), getDeliveryTypeAnalytics(), getFarmerPerformance() (+24 more)

### Community 3 - "app.js"
Cohesion: 0.10
Nodes (22): app, connectDB, allowedOrigins, app, compression, cors, dashboardRoutes, dotenv (+14 more)

### Community 4 - "geolocationController.js"
Cohesion: 0.13
Nodes (18): calculateDistanceBetweenPoints(), Delivery, Farmer, geo, getNearbyFarmers(), getNearestDeliveries(), recordDropoffLocation(), recordPickupLocation() (+10 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.09
Nodes (22): name, private, type, version, autoprefixer, axios, bootstrap, date-fns (+14 more)

### Community 6 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, axios, bootstrap, chart.js, date-fns, @hookform/resolvers, jsonwebtoken, jspdf (+15 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, daisyui, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 8 - "payments.js"
Cohesion: 0.18
Nodes (14): createPayment(), deletePayment(), Farmer, getPayments(), Payment, retryPayment(), updatePayment(), User (+6 more)

### Community 9 - "farmers.js"
Cohesion: 0.18
Nodes (14): createFarmer(), deleteFarmer(), Farmer, getFarmer(), getFarmers(), searchFarmers(), updateFarmer(), User (+6 more)

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

### Community 17 - "Farmer.js"
Cohesion: 0.18
Nodes (7): dotenv, Farmer, mongoose, farmerSchema, mongoose, dotenv, ref_dotenv

### Community 18 - "APICache"
Cohesion: 0.22
Nodes (3): APICache, cachedFetch(), invalidateCache()

### Community 19 - "dashboard.js"
Cohesion: 0.20
Nodes (9): dashboardReadLimiter, Delivery, Farmer, Payment, PENDING_STATUS, rateLimit, router, SUCCESS_STATUS (+1 more)

### Community 20 - "permissions.js"
Cohesion: 0.28
Nodes (4): canRead(), canUpdate(), hasPermission(), PERMISSIONS

### Community 21 - "vercel.json"
Cohesion: 0.22
Nodes (8): maxDuration, buildCommand, functions, api/index.js, installCommand, outputDirectory, rewrites, $schema

### Community 22 - "ref_mongoose"
Cohesion: 0.29
Nodes (6): getUnpaidDeliveriesByFarmer(), mongoose, paymentSchema, mongoose, userSchema, ref_mongoose

### Community 23 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, preview, start, test, test:e2e

### Community 24 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): ref_eslint_config, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 25 - "Reports"
Cohesion: 0.40
Nodes (3): Reports(), fetchAllData(), processData()

### Community 26 - "DeliveryMap.jsx"
Cohesion: 0.40
Nodes (4): DefaultIcon, DeliveryMap(), leaflet, ref_leaflet_dist_leaflet_css

### Community 27 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, build:backend, build:frontend, start

### Community 28 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 29 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, fast-xml-parser, path-to-regexp

### Community 32 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, npm

### Community 33 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, fast-xml-parser, path-to-regexp

## Knowledge Gaps
- **240 isolated node(s):** `allNavItems`, `allQuickActions`, `ThemeContext`, `bcrypt`, `crypto` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 290 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jsonwebtoken` connect `backend/package.json` to `package.json`, `frontend/package.json`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `react` connect `App.jsx` to `DeliveryMap.jsx`, `frontend/package.json`, `geolocationService.js`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `allNavItems`, `allQuickActions`, `ThemeContext` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06932052161976665 - nodes in this community are weakly interconnected._
- **Should `authController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06086956521739131 - nodes in this community are weakly interconnected._
- **Should `reports.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08258258258258258 - nodes in this community are weakly interconnected._