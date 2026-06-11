# Role-Based Access Control Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MENTOR-MENTEE SYSTEM                                  │
│                     Role-Based Access Control Flow                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER AUTHENTICATION                                   │
│                                                                               │
│  Step 1: User Login (POST /api/auth/login)                                  │
│  Step 2: Server returns JWT Token with user role embedded                   │
│  Step 3: Client stores token (role: 'admin' | 'mentor' | 'mentee')         │
│  Step 4: All subsequent requests include token in Authorization header      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE AUTHORIZATION LAYER                            │
│                                                                               │
│  1. authenticate (required for all protected routes)                         │
│     ↓ Verifies JWT token validity                                           │
│     ↓ Checks user is active                                                 │
│     ↓ Attaches user object to request                                       │
│                                                                               │
│  2. adminOnly (admin exclusive routes)                                       │
│     ↓ Checks if req.user.role === 'admin'                                   │
│     ↓ Returns 403 if not admin                                              │
│                                                                               │
│  3. mentorOnly (mentor exclusive routes)                                     │
│     ↓ Checks if req.user.role === 'mentor'                                  │
│     ↓ Returns 403 if not mentor                                             │
│                                                                               │
│  4. canAccessMentee (mentee-specific access)                                │
│     ↓ If admin: Allow all                                                   │
│     ↓ If mentor: Check if mentee is assigned                                │
│     ↓ If mentee: Only allow viewing own data                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL ACCESS                                    │
│                                                                               │
│  Route: /api/admin/*                                                        │
│  Required: authenticate + adminOnly                                         │
│                                                                               │
│  Can Access:                                                                 │
│  ✓ All Users (mentors, mentees, admins)                                     │
│  ✓ All Mentor Forms                                                         │
│  ✓ All Mentee Forms                                                         │
│  ✓ Any User's Progress                                                      │
│  ✓ All Analytics & Statistics                                               │
│  ✓ All Mentees by Mentor                                                    │
│  ✓ Deactivate Users                                                         │
│                                                                               │
│  Endpoints:                                                                  │
│  • GET /api/admin/dashboard/stats          - Overall statistics             │
│  • GET /api/admin/all-users                - All users list                 │
│  • GET /api/admin/mentor-forms             - All mentor forms               │
│  • GET /api/admin/mentee-forms             - All mentee forms               │
│  • GET /api/admin/user/:id/progress        - Any user progress              │
│  • GET /api/admin/mentor/:id/mentees       - Mentor's mentees               │
│  • GET /api/admin/analytics/ratings        - Global analytics               │
│  • DELETE /api/admin/user/:id              - Deactivate user                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       MENTOR PANEL ACCESS                                     │
│                                                                               │
│  Route: /api/mentor/*                                                       │
│  Required: authenticate + (mentorOnly or canAccessMentee)                   │
│                                                                               │
│  Can Access:                                                                 │
│  ✓ Own Dashboard                                                            │
│  ✓ Only Assigned Mentees                                                    │
│  ✓ Only Assigned Mentees' Progress                                          │
│  ✓ Only Assigned Mentees' Forms                                             │
│  ✓ Own Forms                                                                │
│  ✓ Own Analytics (mentees only)                                             │
│                                                                               │
│  Cannot Access:                                                              │
│  ✗ Other Mentors' Mentees                                                   │
│  ✗ Other Mentors' Data                                                      │
│  ✗ All Users                                                                │
│  ✗ Global Analytics                                                         │
│                                                                               │
│  Access Control Logic:                                                       │
│  When accessing /api/mentor/mentee/:id/*                                    │
│    Check: Is this mentee assigned to me?                                    │
│    ├─ Yes → Allow Access                                                    │
│    └─ No  → Return 403 Forbidden                                            │
│                                                                               │
│  Endpoints:                                                                  │
│  • GET /api/mentor/dashboard               - My dashboard                   │
│  • GET /api/mentor/mentees                 - My mentees list                │
│  • GET /api/mentor/mentee/:id/progress     - Mentee progress*               │
│  • GET /api/mentor/mentee/:id/forms        - Mentee forms*                  │
│  • GET /api/mentor/my-forms                - My forms                       │
│  • GET /api/mentor/analytics               - My analytics                   │
│  • GET /api/mentor/mentee/:id/form/:id     - Form details*                  │
│                                                                               │
│  * Only accessible if mentee is assigned to mentor                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    MENTEE RESTRICTIONS (Implicit)                             │
│                                                                               │
│  Mentee users can access:                                                   │
│  ✓ POST /api/mentee-forms/* (submit forms)                                  │
│  ✓ GET /api/progress/mentee/myId (own progress)                             │
│                                                                               │
│  Cannot access:                                                              │
│  ✗ /api/admin/* (all admin endpoints)                                       │
│  ✗ /api/mentor/* (all mentor endpoints)                                     │
│  ✗ Other mentees' data                                                      │
│  ✗ Other users' forms                                                       │
│                                                                               │
│  Protected by: General authorization in endpoint logic                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       REQUEST FLOW EXAMPLE                                    │
│                                                                               │
│  Mentor requests: GET /api/mentor/mentee/123/progress                      │
│                                                                               │
│  1. Request received with Authorization header                              │
│  2. authenticate middleware:                                                │
│     ✓ Verify token is valid                                                │
│     ✓ Extract user from database                                           │
│     ✓ Attach user to req.user                                              │
│                                                                               │
│  3. mentorOnly middleware:                                                  │
│     ✓ Check req.user.role === 'mentor'                                     │
│     ✓ If not: Return 403                                                   │
│                                                                               │
│  4. canAccessMentee middleware:                                             │
│     ✓ Get mentee (ID: 123) from database                                   │
│     ✓ Check: mentee.mentor === req.user._id                               │
│     ✓ If not: Return 403 "Not assigned to you"                             │
│                                                                               │
│  5. Route handler:                                                          │
│     ✓ Query mentee's forms and progress                                    │
│     ✓ Return data                                                          │
│                                                                               │
│  Error Examples:                                                            │
│  • Invalid token → 401 Unauthorized                                        │
│  • User is mentee → 403 Access denied                                      │
│  • Mentee not assigned → 403 Not assigned to you                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS ISOLATION MATRIX                               │
│                                                                               │
│                        Admin    Mentor    Mentee    Other                    │
│  ─────────────────────────────────────────────────────────────              │
│  Admin Data           ✓✓✓       ✓         ✓         ✓                        │
│  Other Admin Data     ✓✓✓       ✗         ✗         ✗                        │
│  Mentor Own Data      ✓         ✓✓✓       ✗         ✗                        │
│  Other Mentor Data    ✓         ✗         ✗         ✗                        │
│  Mentee Own Data      ✓         ✓         ✓✓✓       ✗                        │
│  Other Mentee Data    ✓         ✗         ✗         ✗                        │
│  ─────────────────────────────────────────────────────────────              │
│  ✓✓✓ = Full access                                                          │
│  ✓   = Limited access                                                       │
│  ✗   = No access                                                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     SECURITY FEATURES                                         │
│                                                                               │
│  1. JWT Token Verification                                                  │
│     - Token must be valid and not expired                                   │
│     - Token contains user role                                              │
│                                                                               │
│  2. Role-Based Authorization                                                │
│     - Each endpoint checks required roles                                    │
│     - Returns 403 if role mismatch                                          │
│                                                                               │
│  3. Relationship Verification                                               │
│     - Mentors can only access assigned mentees                              │
│     - Verified by checking mentor field in mentee document                  │
│                                                                               │
│  4. Active User Check                                                       │
│     - Deactivated users cannot access any endpoint                          │
│                                                                               │
│  5. Audit Trail                                                             │
│     - Admin can see all activities via form records                         │
│     - Timestamps and user IDs are recorded                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Files Modified/Created:

1. **models/User.js**
   - Added 'admin' role to enum

2. **middleware/auth.js**
   - Added `adminOnly` middleware
   - Added `mentorOnly` middleware
   - Added `canAccessMentee` middleware for relationship verification

3. **routes/admin.js** (NEW)
   - 8 endpoints for admin panel access to all data

4. **routes/mentor.js** (NEW)
   - 7 endpoints for mentor panel with mentee access restrictions

5. **server.js**
   - Imported and registered both new route files

6. **Documentation Files** (NEW)
   - RBAC_DOCUMENTATION.md - Complete RBAC documentation
   - POSTMAN_RBAC_ENDPOINTS.md - Postman testing guide

### Key Security Principles:

1. **Principle of Least Privilege**: Users only get access to data they need
2. **Relationship-Based Access**: Mentors verified through mentee.mentor field
3. **Role-Based Gates**: Routes check role before processing
4. **Audit Trail**: All data is timestamped and traceable
5. **Token Security**: All endpoints verify token before processing

### Database Relationships:

```
User (Mentor) ←── mentor field ──→ User (Mentee)
                                    │
                                    ├── submits → MenteeForm
                                    └── monitored by → MentorForm

User (Admin)
│
├── views → All Users
├── audits → All Forms
└── analyzes → All Progress
```
