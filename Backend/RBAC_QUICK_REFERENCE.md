# RBAC Quick Reference Card

## 📋 Quick Endpoint Reference

### ADMIN PANEL (`/api/admin`)
```
Dashboard Stats              GET /dashboard/stats
Get All Users              GET /all-users?role=&search=&page=1&limit=20
Get Mentor Forms           GET /mentor-forms?mentorId=&menteeId=&page=1
Get Mentee Forms           GET /mentee-forms?mentorId=&menteeId=&page=1
Get User Progress          GET /user/:userId/progress?timeRange=30
Get Mentor's Mentees       GET /mentor/:mentorId/mentees?page=1&limit=20
Get Analytics - Ratings    GET /analytics/ratings
Delete User (Deactivate)   DELETE /user/:userId

Access: Bearer token + role: 'admin' required
```

### MENTOR PANEL (`/api/mentor`)
```
Mentor Dashboard           GET /dashboard
Get My Mentees            GET /mentees?search=&page=1&limit=20
Get Mentee Progress       GET /mentee/:menteeId/progress?timeRange=30
Get Mentee Forms          GET /mentee/:menteeId/forms?formType=both&page=1
Get My Forms              GET /my-forms?page=1&limit=20
Get Mentor Analytics      GET /analytics
Get Form Details          GET /mentee/:menteeId/form/:formId

Access: Bearer token + role: 'mentor' required
        Mentor can only access assigned mentees
```

---

## 🔐 Authorization Rules

```
Admin:   ✅ Everything        (All users, all forms, all data)
Mentor:  ✅ Own mentees only  (Can't see other mentors' mentees)
Mentee:  ✅ Own data only     (Can't access admin or mentor panels)
```

---

## 📊 Response Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Request processed successfully |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | No permission for this data |
| 404 | Not Found | User/form/resource doesn't exist |
| 500 | Server Error | Backend processing error |

---

## 🔑 Header Required

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

All authenticated endpoints require this header.

---

## 📝 Common Payloads

### Query Parameters (GET requests)

**Pagination:**
```
?page=1&limit=20
```

**Filtering:**
```
?role=mentor
?mentorId=<id>
?menteeId=<id>
?search=john
```

**Time Range:**
```
?timeRange=30  // last 30 days
```

**Sorting:**
```
?sortBy=sessionDate&order=-1  // -1: descending, 1: ascending
```

---

## ✅ Testing Checklist

Quick verification steps:

[ ] Admin can view all users
[ ] Admin can view all forms
[ ] Mentor can view own mentees
[ ] Mentor CANNOT view other mentor's mentees (403)
[ ] Mentee CANNOT access admin panel (403)
[ ] Mentee CANNOT access mentor panel (403)
[ ] Without token: 401 error
[ ] Invalid token: 401 error

---

## 🚀 Getting Started

### 1. Start Backend
```bash
npm run dev
```

### 2. Create Users
```
POST /api/auth/register
- Admin (role: 'admin')
- Mentor (role: 'mentor')
- Mentee (role: 'mentee', mentorEmail: mentor's email)
```

### 3. Get Tokens
```
POST /api/auth/login
Use email & password from registration
```

### 4. Test Endpoints
```
Use tokens with /api/admin and /api/mentor endpoints
```

---

## 🔍 Debugging Tips

**404 Error:** User/Form ID invalid → Copy from list responses
**403 Error:** Not authorized → Check role and relationships
**401 Error:** Token missing → Add Authorization header
**500 Error:** Server issue → Check backend logs

---

## 📱 Postman Setup

**Create Collections:**
1. Admin Collection
2. Mentor Collection
3. Mentee Collection (can't access RBAC endpoints)

**For each request:**
1. Method: GET/POST/DELETE
2. URL: paste from reference card
3. Headers: `Authorization: Bearer {{TOKEN}}`
4. Click Send

---

## 🎯 Common Workflows

### Admin Review
```
1. GET /api/admin/all-users              (List all users)
2. GET /api/admin/user/:id/progress      (View user progress)
3. GET /api/admin/analytics/ratings      (View statistics)
```

### Mentor Monitoring
```
1. GET /api/mentor/dashboard             (Overview)
2. GET /api/mentor/mentees               (My mentees)
3. GET /api/mentor/mentee/:id/progress   (Mentee progress)
```

### Mentee Self-Check
```
1. GET /api/progress/mentee/:id          (Own progress)
2. POST /api/mentee-forms                (Submit form)
```

---

## 🛡️ Security Notes

✓ Always use HTTPS in production
✓ Never expose tokens in URLs
✓ Tokens expire after 7 days
✓ Re-login to get new token
✓ Keep JWT secret secure
✓ Admin should be restricted user count

---

## 📞 Need Help?

See documentation files:
- **RBAC_SETUP_GUIDE.md** - Setup & troubleshooting
- **RBAC_DOCUMENTATION.md** - Complete API docs
- **RBAC_ARCHITECTURE.md** - System design
- **POSTMAN_RBAC_ENDPOINTS.md** - Postman guide

---

## 📍 Endpoint Locations

**Admin Routes:** `/Backend/routes/admin.js`
**Mentor Routes:** `/Backend/routes/mentor.js`
**Auth Middleware:** `/Backend/middleware/auth.js`
**User Model:** `/Backend/models/User.js`

---

**Last Updated:** June 2026
**Status:** ✅ Production Ready
