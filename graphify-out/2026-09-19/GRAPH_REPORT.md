# Graph Report - OCMS  (2026-09-19)

## Corpus Check
- 86 files · ~58,696 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 8, .mdc 1, .conf 1)

## Summary
- 537 nodes · 927 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b38346e4`
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
- User.js
- permissions.js
- vercel.json
- ref_mongoose
- Reports
- scripts
- scripts
- overrides
- engines
- overrides

## God Nodes (most connected - your core abstractions)
1. `react` - 31 edges
2. `react-router-dom` - 20 edges
3. `lucide-react` - 18 edges
4. `api` - 15 edges
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
- `Header()` --calls--> `useTheme()`  [EXTRACTED]
  frontend/src/components/Header.jsx → frontend/src/context/ThemeContext.jsx

## Import Cycles
- None detected.

## Communities (30 total, 2 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.07
Nodes (54): App(), AuthTogglePage, Dashboard, Deliveries, EditDelivery, Farmers, ForgotPassword, LandingPage (+46 more)

### Community 1 - "authController.js"
Cohesion: 0.06
Nodes (42): bcrypt, changePassword(), createEmailTransporter(), createSession(), crypto, deleteSession(), forgotPassword(), getDeviceInfo() (+34 more)

### Community 2 - "reports.js"
Cohesion: 0.16
Nodes (17): Delivery, Farmer, generateReport(), getCashflowForecast(), getComparativeAnalytics(), getDeliveriesReport(), getDeliveryTypeAnalytics(), getFarmerPerformance() (+9 more)

### Community 3 - "app.js"
Cohesion: 0.07
Nodes (31): app, connectDB, allowedOrigins, app, compression, cors, dashboardRoutes, dotenv (+23 more)

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
Cohesion: 0.18
Nodes (14): createPayment(), deletePayment(), Farmer, getPayments(), Payment, retryPayment(), updatePayment(), User (+6 more)

### Community 9 - "farmers.js"
Cohesion: 0.09
Nodes (29): createFarmer(), deleteFarmer(), Farmer, getFarmer(), getFarmers(), searchFarmers(), updateFarmer(), User (+21 more)

### Community 10 - "optimize-db-indexes.js"
Cohesion: 0.12
Nodes (12): mongoose, passwordResetSchema, mongoose, sessionSchema, Delivery, dotenv, Farmer, mongoose (+4 more)

### Community 11 - "backend/package.json"
Cohesion: 0.11
Nodes (17): author, description, devDependencies, nodemon, cors, express, mongoose, keywords (+9 more)

### Community 12 - "deliveries.js"
Cohesion: 0.23
Nodes (11): createDelivery(), deleteDelivery(), Delivery, getDeliveries(), getDelivery(), updateDelivery(), User, express (+3 more)

### Community 13 - "package.json"
Cohesion: 0.13
Nodes (14): author, description, bcryptjs, cors, dotenv, express, express-validator, jsonwebtoken (+6 more)

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

### Community 20 - "permissions.js"
Cohesion: 0.28
Nodes (4): canRead(), canUpdate(), hasPermission(), PERMISSIONS

### Community 21 - "vercel.json"
Cohesion: 0.22
Nodes (8): maxDuration, buildCommand, functions, api/index.js, installCommand, outputDirectory, rewrites, $schema

### Community 22 - "ref_mongoose"
Cohesion: 0.33
Nodes (6): getDeliveryTypesByFarmer(), getTotalKgsByType(), getUnpaidDeliveriesByFarmer(), mongoose, paymentSchema, ref_mongoose

### Community 25 - "Reports"
Cohesion: 0.40
Nodes (3): Reports(), fetchAllData(), processData()

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
- **240 isolated node(s):** `ThemeContext`, `allNavItems`, `allQuickActions`, `bcrypt`, `crypto` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 292 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jsonwebtoken` connect `package.json` to `backend/package.json`, `frontend/package.json`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `react` connect `App.jsx` to `frontend/package.json`, `geolocationService.js`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `ThemeContext`, `allNavItems`, `allQuickActions` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0681766186227408 - nodes in this community are weakly interconnected._
- **Should `authController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06086956521739131 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06507936507936508 - nodes in this community are weakly interconnected._