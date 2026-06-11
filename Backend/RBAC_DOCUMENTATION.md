# Role-Based Access Control Implementation

## Overview
Implemented comprehensive role-based access control with three user roles:
- **Admin**: Can see all forms, responses, and progress data of all users
- **Mentor**: Can only see their assigned mentees' progress and forms
- **Mentee**: Can only see their own progress and forms

---

## User Roles

### 1. Admin Role
- View all users (mentors and mentees)
- View all mentor forms and responses
- View all mentee forms and responses
- Access complete progress data for any user
- View analytics across all users
- Deactivate users
- Access dashboard with overall statistics

### 2. Mentor Role
- View only their assigned mentees
- View mentee progress and forms
- Submit forms about mentee understanding and engagement
- Access mentor-specific dashboard
- View analytics about their mentees' practice patterns
- Cannot view other mentors' mentees

### 3. Mentee Role
- View own progress
- Submit self-reflection forms
- Cannot view other mentees' data

---

## API Endpoints

### Admin Panel Endpoints

#### 1. Dashboard Statistics
```
GET /api/admin/dashboard/stats
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "mentors": 10,
      "mentees": 50,
      "admins": 2,
      "total": 62
    },
    "forms": {
      "mentorForms": 300,
      "menteeForms": 250,
      "total": 550
    },
    "ratings": {
      "avgMentorUnderstandingRating": 4.2,
      "avgMenteeRating": 4.5
    }
  }
}
```

#### 2. Get All Users
```
GET /api/admin/all-users?role=mentor&search=John&page=1&limit=20
Authorization: Bearer <token>
```
**Query Parameters:**
- `role`: Optional - 'mentor', 'mentee', or 'admin'
- `search`: Optional - search by name or email
- `page`: Optional - default 1
- `limit`: Optional - default 20

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "total": 100,
      "pages": 5,
      "currentPage": 1,
      "limit": 20
    }
  }
}
```

#### 3. Get All Mentor Forms
```
GET /api/admin/mentor-forms?mentorId=<id>&menteeId=<id>&page=1&limit=20&sortBy=sessionDate&order=-1
Authorization: Bearer <token>
```
**Query Parameters:**
- `mentorId`: Optional - filter by mentor
- `menteeId`: Optional - filter by mentee
- `page`: Optional - default 1
- `limit`: Optional - default 20
- `sortBy`: Optional - 'sessionDate', 'understandingRating', etc.
- `order`: Optional - '1' for ascending, '-1' for descending

#### 4. Get All Mentee Forms
```
GET /api/admin/mentee-forms?mentorId=<id>&menteeId=<id>&page=1&limit=20
Authorization: Bearer <token>
```
**Same query parameters as mentor forms**

#### 5. Get User Progress (Any User)
```
GET /api/admin/user/:userId/progress?timeRange=30
Authorization: Bearer <token>
```
**Path Parameters:**
- `userId`: The ID of the user to view

**Query Parameters:**
- `timeRange`: Optional - number of days (default 30)

**Response:** Includes all forms and progress data for the user

#### 6. Get Mentor's Mentees
```
GET /api/admin/mentor/:mentorId/mentees?page=1&limit=20
Authorization: Bearer <token>
```
**Response:** List of all mentees assigned to the mentor

#### 7. Analytics - Ratings
```
GET /api/admin/analytics/ratings
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "mentorRatings": {
      "avgUnderstanding": 4.2,
      "minUnderstanding": 1,
      "maxUnderstanding": 5,
      "count": 300
    },
    "menteeRatings": {
      "avgConfidence": 4.1,
      "minConfidence": 1,
      "maxConfidence": 5,
      "avgStars": 4.3,
      "count": 250
    },
    "practiceStats": {
      "Yes": 200,
      "No": 50
    }
  }
}
```

#### 8. Delete User (Deactivate)
```
DELETE /api/admin/user/:userId
Authorization: Bearer <token>
```
**Response:** Deactivated user object

---

### Mentor Panel Endpoints

#### 1. Mentor Dashboard
```
GET /api/mentor/dashboard
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "mentees": [...],
    "recentForms": [...],
    "stats": {
      "totalMentees": 5,
      "totalSessions": 45,
      "avgUnderstanding": 4.1,
      "uniqueMentees": 5
    }
  }
}
```

#### 2. Get My Mentees
```
GET /api/mentor/mentees?search=John&page=1&limit=20
Authorization: Bearer <token>
```
**Query Parameters:**
- `search`: Optional - search by name or email
- `page`: Optional - default 1
- `limit`: Optional - default 20

**Response:** List of mentees assigned to the current mentor

#### 3. Get Mentee Progress
```
GET /api/mentor/mentee/:menteeId/progress?timeRange=30
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "mentee": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "mentee"
    },
    "menteeForms": [...],
    "mentorForms": [...],
    "statistics": {
      "menteeStats": {
        "totalForms": 10,
        "avgConfidence": 4.1,
        "avgStars": 4.2,
        "practicedCount": 8
      },
      "mentorStats": {
        "totalSessions": 10,
        "avgUnderstanding": 4.0,
        "avgEngagement": 4.1
      }
    }
  }
}
```

#### 4. Get Mentee Forms
```
GET /api/mentor/mentee/:menteeId/forms?formType=both&page=1&limit=20
Authorization: Bearer <token>
```
**Query Parameters:**
- `formType`: Optional - 'both', 'mentee', or 'mentor' (default 'both')
- `page`: Optional - default 1
- `limit`: Optional - default 20

#### 5. Get My Forms
```
GET /api/mentor/my-forms?page=1&limit=20&sortBy=sessionDate&order=-1
Authorization: Bearer <token>
```
**Response:** All forms submitted by the mentor

#### 6. Mentor Analytics
```
GET /api/mentor/analytics
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalSessions": 45,
      "avgUnderstanding": 4.1,
      "avgEngagement": 4.0
    },
    "menteePerformance": [
      {
        "menteeName": "John Doe",
        "menteeEmail": "john@example.com",
        "sessionCount": 10,
        "avgUnderstanding": 4.2,
        "avgEngagement": 4.1
      }
    ],
    "practiceStats": {
      "Yes": 35,
      "No": 10
    }
  }
}
```

#### 7. Get Specific Form Details
```
GET /api/mentor/mentee/:menteeId/form/:formId
Authorization: Bearer <token>
```
**Response:** Detailed form data with all fields

---

## Authentication & Authorization

### Token Structure
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Middleware

#### Admin Only
```javascript
authenticate + adminOnly
```
- Only users with role: 'admin' can access

#### Mentor Only
```javascript
authenticate + mentorOnly
```
- Only users with role: 'mentor' can access

#### Mentor Access to Mentees
```javascript
authenticate + canAccessMentee
```
- Mentor can only access their assigned mentees
- Admin can access any mentee
- Mentee can only access their own data

---

## Access Control Rules

### Admin Panel
- ✅ View all users
- ✅ View all forms (mentor and mentee)
- ✅ View progress for any user
- ✅ View analytics across all data
- ✅ Delete/deactivate users

### Mentor Panel
- ✅ View own dashboard and statistics
- ✅ View assigned mentees list
- ✅ View assigned mentees' progress
- ✅ View assigned mentees' forms
- ❌ Cannot view other mentors' mentees
- ❌ Cannot view all mentees (only assigned)
- ❌ Cannot view other mentors' forms

### Mentee Restrictions
- ✅ View own progress
- ✅ Submit self-reflection forms
- ❌ Cannot view other mentees' data
- ❌ Cannot view forms from other mentees

---

## Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Usage Examples

### 1. Admin Views All Mentee Forms
```bash
curl -X GET "http://localhost:4000/api/admin/mentee-forms?page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

### 2. Mentor Views Their Mentees
```bash
curl -X GET "http://localhost:4000/api/mentor/mentees" \
  -H "Authorization: Bearer <mentor_token>"
```

### 3. Mentor Views Specific Mentee Progress
```bash
curl -X GET "http://localhost:4000/api/mentor/mentee/<mentee_id>/progress?timeRange=30" \
  -H "Authorization: Bearer <mentor_token>"
```

### 4. Admin Views User Progress
```bash
curl -X GET "http://localhost:4000/api/admin/user/<user_id>/progress?timeRange=30" \
  -H "Authorization: Bearer <admin_token>"
```

---

## Creating Admin Users

To create an admin user, you need to:

1. Register via the auth endpoint:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@123",
  "role": "admin"
}
```

2. Or update an existing user's role directly in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## Notes

- Mentors cannot access progress of mentees assigned to other mentors
- All timestamps are in UTC format
- Pagination is optional; defaults to page 1 with 20 items per page
- Sorting can be done by any form field
- All form data is populated with user information
- Analytics calculations are done in real-time from database
