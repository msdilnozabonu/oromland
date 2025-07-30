# Dashboard System Information

## Login Credentials
**Password for all roles:** `Qwerty123@`

**Usernames:**
- SuperAdmin: `superadmin`
- Admin: `admin`
- Manager: `manager`
- Operator: `operator`
- User: `user`

## Dashboard Overview

### 1. SuperAdmin Dashboard
**Access:** Full system control
**Base URL:** `/dashboard/super-admin`

**Key Features:**
- **Overview:**
  - Total users, camps, sanatoriums, bookings, documents, feedbacks (stats/cards)
  - Recent activities (audit log)
- **Management Sections:**
  - Camps – CRUD + search/filter
  - Sanatoriums – CRUD + search/filter
  - Users – CRUD + role assignment/dismissal
  - Bookings – View/edit/delete all bookings
  - Documents – Manage all documents
  - Feedbacks – View/delete feedbacks
- **Role Control:**
  - Assign/dismiss roles (Admin/Manager/Operator)

**API Endpoints:**
```
GET /dashboard/super-admin – Returns all management lists

Camps:
GET /dashboard/super-admin/camps – List of Camps
GET /dashboard/super-admin/camps/{id} – Get camp by ID
POST /dashboard/super-admin/camps/create-camp – Create a new camp
POST /dashboard/super-admin/camps/{id} – Update a camp field
DELETE /dashboard/super-admin/camps/{id} – Delete a camp

Sanatoriums:
GET /dashboard/super-admin/sanatoriums – List of Sanatoriums
GET /dashboard/super-admin/sanatoriums/{id} – Get sanatorium by ID
POST /dashboard/super-admin/sanatoriums/create-sanatorium – Create a new sanatorium
POST /dashboard/super-admin/sanatoriums/{id} – Update a sanatorium field
DELETE /dashboard/super-admin/sanatoriums/{id} – Delete a sanatorium

Users:
GET /dashboard/super-admin/users – List of Users
GET /dashboard/super-admin/users/{id} – Get user by ID
POST /dashboard/super-admin/users/create-user – Create a new user
POST /dashboard/super-admin/users/{id} – Update a user field
DELETE /dashboard/super-admin/users/{id} – Delete a user

Bookings:
GET /dashboard/super-admin/bookings – List of Bookings
GET /dashboard/super-admin/bookings/{id} – Get booking by ID
POST /dashboard/super-admin/bookings/create-booking – Create a new booking
POST /dashboard/super-admin/bookings/{id} – Update a booking field
DELETE /dashboard/super-admin/bookings/{id} – Delete a booking

Documents:
GET /dashboard/super-admin/documents – List of Documents
GET /dashboard/super-admin/documents/{id} – Get document by ID
POST /dashboard/super-admin/documents/create-document – Create a new document
POST /dashboard/super-admin/documents/{id} – Update a document field
DELETE /dashboard/super-admin/documents/{id} – Delete a document

Feedbacks:
GET /dashboard/super-admin/feedbacks – List of Feedbacks
GET /dashboard/super-admin/feedbacks/{id} – Get feedback by ID
POST /dashboard/super-admin/feedbacks/create-feedback – Create new feedback
POST /dashboard/super-admin/feedbacks/{id} – Update a feedback field
DELETE /dashboard/super-admin/feedbacks/{id} – Delete feedback

Role Management:
POST /dashboard/super-admin/assign/{userId} – Assign role to a user
POST /dashboard/super-admin/dismiss/{userId} – Remove role from a user
```

### 2. Admin Dashboard
**Access:** Almost full control (except modifying SuperAdmin/Admin roles)
**Base URL:** `/dashboard/admin`

**Key Features:**
- **Overview:**
  - Stats for camps, sanatoriums, bookings, users
- **Management Sections:**
  - Same as SuperAdmin but restricted to:
    - Cannot edit SuperAdmin/Admin roles
    - Can assign only Manager/Operator/User roles
- **Search/Filter:**
  - All lists should support search, pagination, and filters

**API Endpoints:**
```
GET /dashboard/admin – Returns all management lists
(Same endpoints as SuperAdmin, but with /admin instead of /super-admin)

Role Management:
POST /dashboard/admin/assign/{userId} – Assign Manager, Operator, or User role
POST /dashboard/admin/dismiss/{userId} – Remove role from a user
```

### 3. Manager Dashboard
**Access:** Assigned camps/sanatoriums only
**Base URL:** `/dashboard/manager`

**Key Features:**
- **Overview:**
  - Assigned camps/sanatoriums (counts, status)
  - Pending document approvals
- **Management Sections:**
  - **Camps/Sanatoriums:**
    - View/update assigned camps/sanatoriums (no delete)
  - **Documents:**
    - Approve/reject documents (with comments)
    - Filter by status (pending/accepted/rejected)
- **Restrictions:**
  - Cannot create/delete camps/sanatoriums
  - No access to other managers' data

**API Endpoints:**
```
GET /dashboard/manager – Returns only assigned management lists

Camps / Sanatoriums:
GET /dashboard/manager/camps – List of assigned camps
GET /dashboard/manager/camps/{id} – View assigned camp
POST /dashboard/manager/camps/{id} – Update assigned camp
GET /dashboard/manager/sanatoriums – List of assigned sanatoriums
GET /dashboard/manager/sanatoriums/{id} – View assigned sanatorium
POST /dashboard/manager/sanatoriums/{id} – Update assigned sanatorium

Documents:
GET /dashboard/manager/documents – List of assigned documents
GET /dashboard/manager/documents/{id} – View document details
POST /dashboard/manager/documents/{id}/accept – Accept document
POST /dashboard/manager/documents/{id}/reject – Reject document
```

### 4. Operator Dashboard
**Access:** Read-only + limited actions
**Base URL:** `/dashboard/operator`

**Key Features:**
- **Overview:**
  - Total users, documents, feedbacks
- **Management Sections:**
  - **Users:**
    - View all users (no edit/delete)
  - **Documents:**
    - View all documents (no approve/reject)
  - **Feedbacks:**
    - View manager feedbacks (read-only)
- **Search/Export:**
  - Filter users/documents by name/date/status

**API Endpoints:**
```
GET /dashboard/operator – Main operator dashboard

Users:
GET /dashboard/operator/users – List of all users
GET /dashboard/operator/users/{id} – User details

Documents:
GET /dashboard/operator/documents – List of all documents
GET /dashboard/operator/documents/{id} – Document details

Feedbacks:
GET /dashboard/operator/feedbacks – Manager feedbacks
```

### 5. User Dashboard
**Access:** Personal data only
**Base URL:** `/dashboard/user`

**Key Features:**
- **Overview:**
  - Active bookings, document statuses
- **Management Sections:**
  - **Bookings:**
    - Create/view/edit bookings
  - **Documents:**
    - Upload/view document status (approved/rejected)
  - **Profile:**
    - Edit personal info (name, contact, etc.)
  - **Feedbacks:**
    - Submit/view feedback

**API Endpoints:**
```
GET /dashboard/user – User's personal dashboard

Bookings:
GET /dashboard/user/bookings – User's bookings
GET /dashboard/user/bookings/{id} – Booking details
POST /dashboard/user/bookings/create-booking – Create a new booking
POST /dashboard/user/bookings/{id} – Update booking

Documents:
GET /dashboard/user/documents – User's documents
GET /dashboard/user/documents/{id} – Document details

Profile:
GET /dashboard/user/profile – View profile
POST /dashboard/user/profile – Update profile

Feedbacks:
GET /dashboard/user/feedbacks – User's feedbacks
GET /dashboard/user/feedbacks/{id} – Feedback details
```

## Common UI Components for All Dashboards

### Navigation
- Role-specific sidebar/menu

### Data Tables
- Pagination, sorting, search/filter

### Forms
- Validation for create/update actions

### Notifications
- Alerts for approvals/rejections, booking confirmations

### Responsive Design
- Works on desktop/tablet/mobile

## Technical Requirements

### Authentication
- JWT/cookies for role-based access

### Permissions
- Middleware to block unauthorized actions

### Search/Filter
- Backend support for queries (e.g., by name, date, status)

## Current Implementation Status

✅ **Completed:**
- Dashboard routing structure
- Role-based navigation
- Overview components for all roles
- Authentication system
- Basic UI components

🚧 **In Progress:**
- Data management components
- API integration
- Search and filter functionality

📋 **Pending:**
- CRUD operations for each role
- Document management system
- Booking system
- Feedback system
- Role assignment interface

## Access URLs

After logging in with the credentials above:
- SuperAdmin: `http://localhost:4201/dashboard/super-admin/overview`
- Admin: `http://localhost:4201/dashboard/admin/overview`
- Manager: `http://localhost:4201/dashboard/manager/overview`
- Operator: `http://localhost:4201/dashboard/operator/overview`
- User: `http://localhost:4201/dashboard/user/overview`

## Notes

1. All passwords are set to `Qwerty123@` for development purposes
2. The system uses role-based routing with guards
3. Each role has specific permissions and access levels
4. The dashboard is responsive and works on all devices
5. Search functionality is required for all data tables
6. All forms include validation
7. The system supports multiple languages (EN, RU, UZ)