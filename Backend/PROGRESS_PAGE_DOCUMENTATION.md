# Progress Page Documentation

## Overview
The Progress Page is designed to visualize growth and provide feedback for motivation and analysis. It combines data from both Mentor and Mentee forms to create a comprehensive dashboard showing learning progress, consistency, and areas for improvement.

---

## Features & Endpoints

### 1. From Mentor's Form → Track Mentee Growth

#### **Understanding Rating (1–5): Line Graph Over Time**
- **Endpoint:** `GET /api/progress/mentee/:menteeId`
- **Query Parameters:**
  - `timeRange` (optional, default: 30 days)
- **Response:**
  - `understandingRatings`: Array of mentor's understanding ratings over time
  - `starsRating`: Mentor's star ratings for mentee
  - `topicCovered`: Topics covered in each session
- **Use Case:** Display a line chart showing how the mentee's understanding has progressed over time

#### **Progress Compared to Yesterday: Heatmap**
- **Endpoint:** `GET /api/progress/mentee/:menteeId`
- **Response Data:**
  - `progressComparisons`: Array with values: "Improved", "Same", "Needs Attention"
- **Color Coding:**
  - Green = Improved
  - Yellow = Same
  - Red = Needs Attention
- **Use Case:** Create a heatmap to visualize daily progress trends

#### **Stars Rating: Average Star Chart**
- **Endpoint:** `GET /api/progress/mentee/:menteeId`
- **Response Data:**
  - `averageStars`: Calculated average of all mentor's star ratings
  - `totalRatings`: Number of times mentor rated
- **Use Case:** Display average satisfaction/performance rating

#### **Challenges Noticed: Tag Cloud**
- **Endpoint:** `GET /api/progress/mentee/:menteeId`
- **Response Data:**
  - `challengesNoticed`: Array of challenges identified by mentor in each session
- **Use Case:** Create a word cloud showing recurring issues/challenges

---

### 2. From Mentee's Form → Self-Reflection

#### **Confidence Rating: Line Chart Over Days**
- **Endpoint:** `GET /api/progress/self-reflection/:menteeId`
- **Query Parameters:**
  - `timeRange` (optional, default: 30 days)
- **Response Data:**
  - `confidenceRatings`: Array of mentee's confidence ratings (1-5) over time with dates
  - `topicCovered`: Topics for each confidence rating entry
- **Use Case:** Display a line chart showing mentee's confidence progression

#### **Applied/Practiced: Pie Chart (Yes vs No %)**
- **Endpoint:** `GET /api/progress/self-reflection/:menteeId`
- **Response Data:**
  - `practiceStats`: Aggregated data showing count of "Yes" and "No" entries
  - Example: `[{ _id: 'Yes', count: 18 }, { _id: 'No', count: 5 }]`
- **Use Case:** Display pie chart with percentage breakdown

#### **Stars Rating for Mentor: Bar Chart**
- **Endpoint:** `GET /api/progress/self-reflection/:menteeId`
- **Response Data:**
  - `mentorRatings`: Array with mentors and their average ratings from mentee
  - `averageRating`: Average star rating for each mentor
  - `totalRatings`: Number of ratings given to each mentor
- **Use Case:** Display bar chart comparing ratings across mentors

#### **Difficulties/Needs More Explanation: Text Log**
- **Endpoint:** `GET /api/progress/self-reflection/:menteeId`
- **Response Data:**
  - `difficulties`: Array of difficulty entries with:
    - `difficultiesEncountered`: Text log of problems faced
    - `needsBetterExplanation`: Topics needing more clarification
    - `sessionDate`: When the difficulty was noted
- **Use Case:** Display text log for mentors to review and address

---

### 3. Combined Dashboard Features

#### **Consistency Streaks: GitHub-like Contribution Calendar**
- **Endpoint:** `GET /api/progress/consistency-streak/:userId`
- **Query Parameters:**
  - `months` (optional, default: 3 - display last 3 months)
- **Response Data:**
  ```json
  {
    "submissionsByDate": {
      "2024-01-15": 2,
      "2024-01-16": 1,
      ...
    },
    "totalDaysWithSubmissions": 45,
    "currentStreak": 7,
    "longestStreak": 12,
    "timeRange": 3,
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-04-01"
    }
  }
  ```
- **Visualization Help:**
  - Each day is a cell (like GitHub contributions)
  - Intensity = number of submissions that day
  - Shows daily consistency
- **Use Case:** Motivate users with streak visualization; identify consistency patterns

---

#### **Level System**
- **Endpoint:** `GET /api/progress/level/:userId`
- **Response Data:**
  ```json
  {
    "level": 2,
    "levelName": "Intermediate",
    "totalSubmissions": 12,
    "progressInLevel": 7,
    "requiredForNextLevel": 10,
    "progressPercentage": 70,
    "levelRanges": {
      "level1": { "name": "Novice", "range": "0-5 logs" },
      "level2": { "name": "Intermediate", "range": "6-15 logs" },
      "level3": { "name": "Advanced", "range": "16-30 logs" },
      "level4": { "name": "Expert", "range": "30+ logs" }
    }
  }
  ```
- **Level Breakdown:**
  - **Level 1 (Novice):** 0-5 logs
  - **Level 2 (Intermediate):** 6-15 logs
  - **Level 3 (Advanced):** 16-30 logs
  - **Level 4 (Expert):** 30+ logs
- **Use Case:** Gamification to encourage consistent participation

---

#### **Mentor vs Mentee Comparison**
- **Endpoint:** `GET /api/progress/comparison/:menteeId`
- **Query Parameters:**
  - `timeRange` (optional, default: 30 days)
- **Response Data:**
  ```json
  {
    "menteeAssessment": {
      "averageConfidence": 3.8,
      "totalSubmissions": 10,
      "data": [...]
    },
    "mentorEvaluation": {
      "averageUnderstanding": 4.2,
      "totalEvaluations": 10,
      "progressBreakdown": {
        "Improved": 6,
        "Same": 3,
        "Needs Attention": 1
      },
      "data": [...]
    },
    "analysis": {
      "alignment": "aligned|overconfident|underconfident|neutral",
      "learningGapStatus": "on_track|gap_identified|progressing_well",
      "confidenceDifference": 0.4,
      "insight": "Great alignment between mentee confidence and mentor evaluation!"
    }
  }
  ```
- **Alignment Types:**
  - **Aligned:** Mentee confidence matches mentor's evaluation (±0.5 rating)
  - **Overconfident:** Mentee shows more confidence (>0.5) than mentor's evaluation
  - **Underconfident:** Mentee shows less confidence (>0.5) than mentor's evaluation
  - **Neutral:** Small differences in ratings
- **Learning Gap Identification:**
  - If mismatched alignment → "gap_identified" (needs attention)
  - If more "Improved" than "Needs Attention" → "progressing_well"
  - Otherwise → "on_track"
- **Use Case:**
  - Identify if mentee needs confidence building
  - Spot learning gaps where understanding and confidence don't match
  - Validate progress through dual assessment

---

### 4. Other Dashboard Endpoints

#### **Generic Dashboard**
- **Endpoint:** `GET /api/progress/dashboard`
- **Response varies by role:**

**For Mentors:**
```json
{
  "role": "mentor",
  "totalMentees": 5,
  "totalSessions": 28,
  "avgMenteeUnderstanding": 4.1,
  "avgStarsFromMentees": 4.5
}
```

**For Mentees:**
```json
{
  "role": "mentee",
  "totalMentors": 2,
  "totalSessions": 15,
  "avgConfidence": 3.7,
  "practiceRate": 80
}
```

#### **Comprehensive Analytics**
- **Endpoint:** `GET /api/progress/analytics/:userId`
- **Returns:** All forms submitted by user with detailed feedback/ratings

#### **Mentor Performance**
- **Endpoint:** `GET /api/progress/mentor/:mentorId`
- **Returns:** Ratings from mentees, understanding ratings given, and progress summary

---

## Data Flow Diagram

```
Mentor Form (Daily)          Mentee Form (Daily)
    |                              |
    ├─ Understanding Rating        ├─ Confidence Rating
    ├─ Progress Comparison         ├─ Applied/Practiced
    ├─ Star Rating                 ├─ Star Rating for Mentor
    ├─ Challenges                  └─ Difficulties/Needs Explanation
    └─ Topic Covered
           |                              |
           └──────────────┬───────────────┘
                          |
                  Progress Dashboard
                          |
        ┌─────────────────┼─────────────────┐
        |                 |                 |
    Mentor View      Mentee View      Admin View
    (Track Mentee)  (Self-Reflection) (Comparison/Analytics)
        |                 |                 |
        ├─ Mentor Form    ├─ Mentee Form   ├─ Streaks
        │  Dashboards     │  Dashboards    ├─ Levels
        │ ├─ Charts       │ ├─ Charts      ├─ Comparison
        │ └─ Analytics    │ └─ Logs        └─ Analytics
        |                 |                 |
```

---

## Sample Frontend Usage

### 1. Display Mentee Growth (Line Chart)
```javascript
// Fetch understanding ratings
const response = await fetch('/api/progress/mentee/:menteeId?timeRange=30');
const data = await response.json();
// Use data.understandingRatings for line chart
```

### 2. Display Consistency Streak
```javascript
// Fetch contribution calendar data
const response = await fetch('/api/progress/consistency-streak/:userId?months=3');
const data = await response.json();
// Use data.submissionsByDate for GitHub-like calendar
// Display data.currentStreak and data.longestStreak
```

### 3. Display Level Progress
```javascript
// Fetch user level
const response = await fetch('/api/progress/level/:userId');
const data = await response.json();
// Show level badge with progressPercentage progress bar
```

### 4. Compare Mentor vs Mentee
```javascript
// Fetch comparison data
const response = await fetch('/api/progress/comparison/:menteeId?timeRange=30');
const data = await response.json();
// Show alignment status and learning gap insights
```

---

## Key Insights & Recommendations

### What Each Metric Tells Us

| Metric | What It Shows | Action Needed |
|--------|---------------|---------------|
| Consistency Streak | Habit formation | Encourage maintaining streaks |
| Level Progress | Cumulative effort | Celebrate level-ups |
| Alignment Status | Learning effectiveness | Address mismatches |
| Progress Comparison | Day-to-day improvement | Identify consistent improvement trends |
| Challenge Tags | Recurring issues | Customize mentor support |
| Practice Rate | Knowledge application | Encourage hands-on practice |

### How Mentors Use This
1. Track mentee growth through understanding ratings
2. Identify challenges and provide targeted support
3. Celebrate progress through level achievements
4. Adjust teaching based on mentee confidence gaps

### How Mentees Use This
1. Reflect on confidence growth
2. Track practice habits
3. See recognition through streaks and levels
4. Compare self-assessment with mentor feedback

---

## API Authentication
All endpoints require:
- Bearer token in `Authorization` header
- Authenticated user (via middleware)
- Appropriate permissions (users can only view their own data unless admin)

## Error Handling
All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Future Enhancements
- [ ] Advanced analytics with predictive trends
- [ ] Badge system for milestones
- [ ] Peer comparison (anonymized)
- [ ] AI-powered insights and recommendations
- [ ] Export reports functionality
- [ ] Integration with learning platform APIs
