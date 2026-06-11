# Role-Based Access Control - Quick Setup & Testing Guide

## 🚀 Quick Setup

### Step 1: Start the Backend Server

```bash
cd Backend
npm install  # if not already done
npm run dev
```

Expected output:
```
Server running on port 4000
Database connected
```

### Step 2: Create Test Users

#### Create Admin User
**Endpoint:** POST `/api/auth/register`
```json
{
  "name": "Admin User",
  "email": "admin@navgurukul.com",
  "password": "Admin@123",
  "role": "admin"
}
```

#### Create Mentor User
**Endpoint:** POST `/api/auth/register`
```json
{
  "name": "Raj Kumar",
  "email": "raj.mentor@navgurukul.com",
  "password": "Mentor@123",
  "role": "mentor",
  "expertise": ["Web Development", "JavaScript", "React"]
}
```

#### Create Mentee Users (2-3)
**Endpoint:** POST `/api/auth/register`
```json
{
  "name": "Ashwini",
  "email": "ashwini@navgurukul.com",
  "password": "Ashwini@123",
  "role": "mentee",
  "mentorEmail": "raj.mentor@navgurukul.com"
}
```

```json
{
  "name": "Priya Singh",
  "email": "priya@navgurukul.com",
  "password": "Priya@123",
  "role": "mentee",
  "mentorEmail": "raj.mentor@navgurukul.com"
}
```

### Step 3: Get JWT Tokens

**Endpoint:** POST `/api/auth/login`

**Admin Login:**
```json
{
  "email": "admin@navgurukul.com",
  "password": "Admin@123"
}
```

**Mentor Login:**
```json
{
  "email": "raj.mentor@navgurukul.com",
  "password": "Mentor@123"
}
```

**Mentee Login:**
```json
{
  "email": "ashwini@navgurukul.com",
  "password": "Ashwini@123"
}
```

Save the tokens returned in the response body.

---

## 🧪 Testing Workflow

### Test 1: Admin Can Access All Data

#### 1.1 Admin Views All Users
```bash
curl -X GET "http://localhost:4000/api/admin/all-users?role=mentee" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** 200 OK with list of all mentees

#### 1.2 Admin Views All Mentee Forms
```bash
curl -X GET "http://localhost:4000/api/admin/mentee-forms?page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** 200 OK with all mentee forms

#### 1.3 Admin Views Any User's Progress
```bash
curl -X GET "http://localhost:4000/api/admin/user/<MENTEE_ID>/progress" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** 200 OK with mentee's complete progress

#### 1.4 Admin Views Dashboard Stats
```bash
curl -X GET "http://localhost:4000/api/admin/dashboard/stats" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** 200 OK with overall statistics

### Test 2: Mentor Can Only Access Their Mentees

#### 2.1 Mentor Views Own Dashboard
```bash
curl -X GET "http://localhost:4000/api/mentor/dashboard" \
  -H "Authorization: Bearer <MENTOR_TOKEN>"
```

**Expected:** 200 OK with mentor's dashboard

#### 2.2 Mentor Views Own Mentees
```bash
curl -X GET "http://localhost:4000/api/mentor/mentees" \
  -H "Authorization: Bearer <MENTOR_TOKEN>"
```

**Expected:** 200 OK with list of assigned mentees

#### 2.3 Mentor Views Assigned Mentee Progress
```bash
curl -X GET "http://localhost:4000/api/mentor/mentee/<ASSIGNED_MENTEE_ID>/progress" \
  -H "Authorization: Bearer <MENTOR_TOKEN>"
```

**Expected:** 200 OK with mentee progress

#### 2.4 Mentor Tries to Access Unassigned Mentee (SHOULD FAIL)
```bash
curl -X GET "http://localhost:4000/api/mentor/mentee/<OTHER_MENTEE_ID>/progress" \
  -H "Authorization: Bearer <MENTOR_TOKEN>"
```

**Expected:** 403 Forbidden - "Access denied. This mentee is not assigned to you"

### Test 3: Mentee Cannot Access Admin Endpoints

#### 3.1 Mentee Tries to Access Admin Dashboard (SHOULD FAIL)
```bash
curl -X GET "http://localhost:4000/api/admin/dashboard/stats" \
  -H "Authorization: Bearer <MENTEE_TOKEN>"
```

**Expected:** 403 Forbidden - "Access denied. Admin role required"

#### 3.2 Mentee Tries to Access Mentor Panel (SHOULD FAIL)
```bash
curl -X GET "http://localhost:4000/api/mentor/dashboard" \
  -H "Authorization: Bearer <MENTEE_TOKEN>"
```

**Expected:** 403 Forbidden - "Access denied. Mentor role required"

### Test 4: No Token Access (SHOULD FAIL)

```bash
curl -X GET "http://localhost:4000/api/admin/dashboard/stats"
```

**Expected:** 401 Unauthorized - "Access denied. No token provided"

---

## 📊 Postman Collection Setup

### Environment Variables

Set these in Postman Environment:

```json
{
  "BASE_URL": "http://localhost:4000/api",
  "ADMIN_TOKEN": "paste_admin_jwt_token_here",
  "MENTOR_TOKEN": "paste_mentor_jwt_token_here",
  "MENTEE_TOKEN": "paste_mentee_jwt_token_here",
  "ADMIN_ID": "paste_admin_user_id_here",
  "MENTOR_ID": "paste_mentor_user_id_here",
  "MENTEE1_ID": "paste_mentee1_user_id_here",
  "MENTEE2_ID": "paste_mentee2_user_id_here"
}
```

### Postman Requests

#### Admin Collection

1. **Admin - Get Dashboard Stats**
   - Method: GET
   - URL: `{{BASE_URL}}/admin/dashboard/stats`
   - Headers: `Authorization: Bearer {{ADMIN_TOKEN}}`

2. **Admin - Get All Users**
   - Method: GET
   - URL: `{{BASE_URL}}/admin/all-users?role=mentee&page=1&limit=10`
   - Headers: `Authorization: Bearer {{ADMIN_TOKEN}}`

3. **Admin - Get All Mentee Forms**
   - Method: GET
   - URL: `{{BASE_URL}}/admin/mentee-forms?page=1&limit=10`
   - Headers: `Authorization: Bearer {{ADMIN_TOKEN}}`

4. **Admin - View User Progress**
   - Method: GET
   - URL: `{{BASE_URL}}/admin/user/{{MENTEE1_ID}}/progress?timeRange=30`
   - Headers: `Authorization: Bearer {{ADMIN_TOKEN}}`

#### Mentor Collection

1. **Mentor - Get Dashboard**
   - Method: GET
   - URL: `{{BASE_URL}}/mentor/dashboard`
   - Headers: `Authorization: Bearer {{MENTOR_TOKEN}}`

2. **Mentor - Get My Mentees**
   - Method: GET
   - URL: `{{BASE_URL}}/mentor/mentees`
   - Headers: `Authorization: Bearer {{MENTOR_TOKEN}}`

3. **Mentor - View Mentee Progress**
   - Method: GET
   - URL: `{{BASE_URL}}/mentor/mentee/{{MENTEE1_ID}}/progress?timeRange=30`
   - Headers: `Authorization: Bearer {{MENTOR_TOKEN}}`
   - **Expected:** 200 OK (if mentee is assigned)

4. **Mentor - View Unassigned Mentee (Access Denied Test)**
   - Method: GET
   - URL: `{{BASE_URL}}/mentor/mentee/{{MENTEE2_ID}}/progress`
   - Headers: `Authorization: Bearer {{MENTOR_TOKEN}}`
   - **Expected:** 403 Forbidden

---

## 🔍 Verification Checklist

### Admin Access ✓
- [ ] Can view all users (mentors and mentees)
- [ ] Can view all mentor forms
- [ ] Can view all mentee forms
- [ ] Can view progress for all users
- [ ] Can view global analytics
- [ ] Can access mentor detail page

### Mentor Access ✓
- [ ] Can view own dashboard
- [ ] Can view assigned mentees list
- [ ] Can view assigned mentees' progress
- [ ] Can view assigned mentees' forms
- [ ] **Cannot** access unassigned mentees (returns 403)
- [ ] Can view own forms
- [ ] Can view own analytics

### Mentee Access ✓
- [ ] **Cannot** access admin endpoints (returns 403)
- [ ] **Cannot** access mentor endpoints (returns 403)
- [ ] Can submit mentee forms
- [ ] Can view own progress

### Authentication ✓
- [ ] Without token: 401
- [ ] With invalid token: 401
- [ ] With expired token: 401
- [ ] With valid token: Proceeds to authorization check

---

## 🐛 Troubleshooting

### Issue: "Cannot POST /api/admin/..."
- **Solution:** Make sure backend is running on port 4000
- Check: `npm run dev` in `/Backend` folder

### Issue: "401 Unauthorized"
- **Solution:** Token is missing or invalid
- Ensure token is in Authorization header as `Bearer <token>`
- Re-login to get fresh token

### Issue: "403 Access Denied"
- **Solution:** User role doesn't have permission
- Check user's role in database
- For mentors accessing mentees, verify mentee.mentor field matches mentor._id

### Issue: "404 User not found"
- **Solution:** User ID is invalid
- Copy ID from response after creating user
- Verify ID format (should be MongoDB ObjectId)

### Issue: Forms show empty arrays
- **Solution:** No forms submitted yet
- Create mentor forms first (POST to `/api/mentor-forms`)
- Create mentee forms first (POST to `/api/mentee-forms`)

---

## 📝 Common Tasks

### Get User IDs for Testing

```bash
# Login and get all users
curl -X GET "http://localhost:4000/api/admin/all-users?limit=100" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Copy the _id field from response
```

### Create Test Data Quickly

1. Use Postman to create 3 users:
   - 1 Mentor
   - 2 Mentees assigned to mentor

2. Login all three to get tokens

3. Create sample forms:
   - Mentor submits form about mentee
   - Mentee submits self-reflection form

### Reset Testing Environment

1. Clear MongoDB collections:
```javascript
db.users.deleteMany({ role: { $in: ['mentor', 'mentee', 'admin'] } })
db.mentorforms.deleteMany({})
db.menteeforms.deleteMany({})
```

2. Start fresh with step 2 of Quick Setup

---

## 🎯 Expected Behavior Summary

| Scenario | Expected Result |
|----------|-----------------|
| Admin access /admin/... | ✅ 200 OK |
| Mentor access /mentor/... | ✅ 200 OK |
| Mentee access /admin/... | ❌ 403 Forbidden |
| Mentor access unassigned mentee | ❌ 403 Forbidden |
| No token access | ❌ 401 Unauthorized |
| Invalid token | ❌ 401 Unauthorized |
| Mentor views own mentees | ✅ 200 OK |
| Mentor views own analytics | ✅ 200 OK |
| Admin views all analytics | ✅ 200 OK |
| Mentor views admin stats | ❌ 403 Forbidden |

---

## 📚 Related Documentation

- **RBAC_DOCUMENTATION.md** - Complete API documentation
- **POSTMAN_RBAC_ENDPOINTS.md** - Postman endpoint reference
- **RBAC_ARCHITECTURE.md** - System architecture diagram
- **Backend/routes/admin.js** - Admin endpoints implementation
- **Backend/routes/mentor.js** - Mentor endpoints implementation
- **Backend/middleware/auth.js** - Authorization middleware
