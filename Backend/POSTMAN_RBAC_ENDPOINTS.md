# Postman Collection - Role-Based Access Control Endpoints

## Admin Routes Base URL: `http://localhost:4000/api/admin`

### 1. Get Dashboard Stats
- **Method:** GET
- **URL:** `{{BASE_URL}}/admin/dashboard/stats`
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`
- **Response:** Overall statistics including user count, form count, and ratings

### 2. Get All Users
- **Method:** GET
- **URL:** `{{BASE_URL}}/admin/all-users?role=mentor&search=&page=1&limit=20`
- **Query Parameters:**
  - `role`: mentor, mentee, admin (optional)
  - `search`: search term (optional)
  - `page`: page number (optional)
  - `limit`: items per page (optional)
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`

### 3. Get All Mentor Forms
- **Method:** GET
- **URL:** `{{BASE_URL}}/admin/mentor-forms?mentorId=&menteeId=&page=1&limit=20&sortBy=sessionDate&order=-1`
- **Query Parameters:**
  - `mentorId`: filter by mentor (optional)
  - `menteeId`: filter by mentee (optional)
  - `page`: page number (optional)
  - `limit`: items per page (optional)
  - `sortBy`: session field to sort by (optional)
  - `order`: 1 for ascending, -1 for descending (optional)
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`

### 4. Get All Mentee Forms
- **Method:** GET
- **URL:** `{{BASE_URL}}/admin/mentee-forms?mentorId=&menteeId=&page=1&limit=20`
- **Query Parameters:**
  - `mentorId`: filter by mentor (optional)
  - `menteeId`: filter by mentee (optional)
  - `page`: page number (optional)
  - `limit`: items per page (optional)
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`

### 5. Get User Progress (Any User)
- **Method:** GET
- **URL:** `{{BASE_URL}}/admin/user/:userId/progress?timeRange=30`
- **Path Parameters:**
  - `userId`: The ID of the user to view progress
- **Query Parameters:**
  - `timeRange`: days to look back (optional, default 30)
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`
- **Response:** All forms and progress for the user

### 6. Get Mentor's Mentees
- **Method:** GET
- **URL:** `{{BASE_URL}}/admin/mentor/:mentorId/mentees?page=1&limit=20`
- **Path Parameters:**
  - `mentorId`: The ID of the mentor
- **Query Parameters:**
  - `page`: page number (optional)
  - `limit`: items per page (optional)
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`

### 7. Get Analytics - Ratings
- **Method:** GET
- **URL:** `{{BASE_URL}}/admin/analytics/ratings`
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`
- **Response:** Aggregate ratings for mentors and mentees, practice statistics

### 8. Delete User (Deactivate)
- **Method:** DELETE
- **URL:** `{{BASE_URL}}/admin/user/:userId`
- **Path Parameters:**
  - `userId`: The ID of the user to deactivate
- **Headers:** 
  - `Authorization: Bearer {{ADMIN_TOKEN}}`
- **Response:** Deactivated user object

---

## Mentor Routes Base URL: `http://localhost:4000/api/mentor`

### 1. Get Mentor Dashboard
- **Method:** GET
- **URL:** `{{BASE_URL}}/mentor/dashboard`
- **Headers:** 
  - `Authorization: Bearer {{MENTOR_TOKEN}}`
- **Response:** Mentees list, recent forms, and statistics

### 2. Get My Mentees
- **Method:** GET
- **URL:** `{{BASE_URL}}/mentor/mentees?search=&page=1&limit=20`
- **Query Parameters:**
  - `search`: search term (optional)
  - `page`: page number (optional)
  - `limit`: items per page (optional)
- **Headers:** 
  - `Authorization: Bearer {{MENTOR_TOKEN}}`

### 3. Get Mentee Progress
- **Method:** GET
- **URL:** `{{BASE_URL}}/mentor/mentee/:menteeId/progress?timeRange=30`
- **Path Parameters:**
  - `menteeId`: The ID of the mentee (must be assigned to mentor)
- **Query Parameters:**
  - `timeRange`: days to look back (optional, default 30)
- **Headers:** 
  - `Authorization: Bearer {{MENTOR_TOKEN}}`
- **Response:** Complete progress data including forms and statistics

### 4. Get Mentee Forms
- **Method:** GET
- **URL:** `{{BASE_URL}}/mentor/mentee/:menteeId/forms?formType=both&page=1&limit=20`
- **Path Parameters:**
  - `menteeId`: The ID of the mentee (must be assigned to mentor)
- **Query Parameters:**
  - `formType`: both, mentee, or mentor (optional, default both)
  - `page`: page number (optional)
  - `limit`: items per page (optional)
- **Headers:** 
  - `Authorization: Bearer {{MENTOR_TOKEN}}`

### 5. Get My Forms
- **Method:** GET
- **URL:** `{{BASE_URL}}/mentor/my-forms?page=1&limit=20&sortBy=sessionDate&order=-1`
- **Query Parameters:**
  - `page`: page number (optional)
  - `limit`: items per page (optional)
  - `sortBy`: field to sort by (optional)
  - `order`: 1 for ascending, -1 for descending (optional)
- **Headers:** 
  - `Authorization: Bearer {{MENTOR_TOKEN}}`
- **Response:** All forms submitted by the mentor

### 6. Get Mentor Analytics
- **Method:** GET
- **URL:** `{{BASE_URL}}/mentor/analytics`
- **Headers:** 
  - `Authorization: Bearer {{MENTOR_TOKEN}}`
- **Response:** Overall statistics, mentee performance, practice statistics

### 7. Get Specific Form Details
- **Method:** GET
- **URL:** `{{BASE_URL}}/mentor/mentee/:menteeId/form/:formId`
- **Path Parameters:**
  - `menteeId`: The ID of the mentee
  - `formId`: The ID of the form
- **Headers:** 
  - `Authorization: Bearer {{MENTOR_TOKEN}}`
- **Response:** Detailed form data

---

## Postman Environment Variables

Set these variables in your Postman environment:

```json
{
  "BASE_URL": "http://localhost:4000/api",
  "ADMIN_TOKEN": "your_admin_jwt_token_here",
  "MENTOR_TOKEN": "your_mentor_jwt_token_here",
  "MENTEE_TOKEN": "your_mentee_jwt_token_here",
  "ADMIN_ID": "admin_user_id",
  "MENTOR_ID": "mentor_user_id",
  "MENTEE_ID": "mentee_user_id"
}
```

---

## Access Control Summary

| Endpoint | Admin | Mentor | Mentee | Notes |
|----------|-------|--------|--------|-------|
| `/admin/dashboard/stats` | ✅ | ❌ | ❌ | Global stats |
| `/admin/all-users` | ✅ | ❌ | ❌ | All users list |
| `/admin/mentor-forms` | ✅ | ❌ | ❌ | All mentor forms |
| `/admin/mentee-forms` | ✅ | ❌ | ❌ | All mentee forms |
| `/admin/user/:id/progress` | ✅ | ❌ | ❌ | Any user progress |
| `/admin/mentor/:id/mentees` | ✅ | ❌ | ❌ | Mentor's mentees |
| `/admin/analytics/ratings` | ✅ | ❌ | ❌ | Global analytics |
| `/admin/user/:id` (DELETE) | ✅ | ❌ | ❌ | Deactivate user |
| `/mentor/dashboard` | ❌ | ✅ | ❌ | Mentor dashboard |
| `/mentor/mentees` | ❌ | ✅ | ❌ | My mentees |
| `/mentor/mentee/:id/progress` | ❌ | ✅* | ❌ | Assigned mentees only |
| `/mentor/mentee/:id/forms` | ❌ | ✅* | ❌ | Assigned mentees only |
| `/mentor/my-forms` | ❌ | ✅ | ❌ | My forms |
| `/mentor/analytics` | ❌ | ✅ | ❌ | My mentees analytics |
| `/mentor/mentee/:id/form/:formId` | ❌ | ✅* | ❌ | Assigned mentees only |

*Blocked for unassigned mentees

---

## Testing Flow

1. **Register Users:**
   - Register admin user with role: 'admin'
   - Register mentor user with role: 'mentor'
   - Register 2-3 mentee users with role: 'mentee'
   - Assign mentees to mentor

2. **Get Tokens:**
   - Login with each user role to get JWT tokens
   - Store tokens in environment variables

3. **Test Admin Endpoints:**
   - View all users
   - View all forms
   - View specific user progress
   - View analytics

4. **Test Mentor Endpoints:**
   - View my mentees
   - View mentee progress
   - View my forms
   - Try accessing unassigned mentee (should fail)

5. **Verify Access Control:**
   - Mentor cannot access other mentor's mentees
   - Mentee cannot access admin endpoints
   - Admin can access all data

---

## Error Code Reference

| Code | Message | Reason |
|------|---------|--------|
| 401 | Authentication required | Missing or invalid token |
| 403 | Access denied | Insufficient permissions |
| 404 | User not found | Invalid user ID |
| 500 | Error fetching data | Server error |

---

## Common Scenarios

### Scenario 1: Admin Reviewing All Progress
```
1. GET /api/admin/all-users?role=mentee (get all mentees)
2. GET /api/admin/user/:menteeId/progress (view each mentee's progress)
3. GET /api/admin/analytics/ratings (view overall statistics)
```

### Scenario 2: Mentor Monitoring Mentees
```
1. GET /api/mentor/dashboard (get overview)
2. GET /api/mentor/mentees (list assigned mentees)
3. GET /api/mentor/mentee/:menteeId/progress (view specific mentee)
4. GET /api/mentor/analytics (view mentee performance)
```

### Scenario 3: Accessing Unauthorized Data
```
1. GET /api/mentor/mentee/:unassignedMenteeId/progress
   → Response: 403 - Access denied. This mentee is not assigned to you
```
