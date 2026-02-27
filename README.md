📑 Project Pitch: Mentor–Mentee Progress Tracker
1. Why We Are Starting This Project
At NavGurukul, pair programming is central to our learning. However, we currently lack a structured way to track what mentors and mentees are learning from each other. Without tracking, it is difficult to:
Measure growth over time.


Identify learning gaps.


Reflect on daily progress.


Show evidence of peer learning to others.


This project solves these problems by creating a platform where mentors and mentees can log daily learnings, give ratings, and view their growth journey.

2. Benefits of This Project
For Students (Mentors + Mentees):
Daily reflection improves retention.


Mutual feedback builds confidence and accountability.


Visual dashboard makes growth measurable and motivating.


Gamification (levels, badges, streaks) encourages consistency.


For NavGurukul:
A scalable tool that strengthens the peer-learning culture.


Data insights on student learning patterns.


Can be showcased as a unique internal innovation.


For Us (Team):
Real-world full-stack project experience.


Strong portfolio project to showcase to recruiters.


Practice in collaboration, documentation, and deployment.



Navbar (Top Menu)
Home → Welcome page with project intro.


Add Task → Form where mentor/mentee submit daily learning log.


Progress → Dashboard with levels, ratings, and leaderboard (competition with other users).


Login / Signup → Authentication page.




1.Home Page
Welcome message: “Welcome to the Mentor–Mentee Progress Tracker.”


Short description of purpose.


Quick links/buttons to Add Task or View Progress.



2. Add Task Page
🔹 Mentor Form (when Mentor fills)
Questions should capture: what they learned from mentee + mentee’s growth
Select Mentee (dropdown, since mentor may have multiple).


Topic/Activity Covered (short text).


What did you learn from the mentee today? (textarea).


How well did the mentee understand today’s topic? (rating 1–5).


Mentee’s progress compared to yesterday? (dropdown: Improved / Same / Needs Attention).


Challenges noticed in the mentee’s learning? (textarea).


Feedback for mentee (optional textarea).


Stars rating for mentee (1–5).



🔹 Mentee Form (when Mentee fills)
Questions should capture: what they learned from mentor + self-reflection
Mentor Name (auto-linked).


Topic/Activity Covered (short text).


What did you learn from the mentor today? (textarea).


How confident do you feel about this topic? (rating 1–5).


Did you apply or practice it? (Yes/No + optional example).


What was difficult for you today? (textarea).


One thing you want your mentor to explain better? (textarea).


Stars rating for mentor (1–5).


3. Progress Page
🔹 1. From Mentor’s Form → Track Mentee Growth
Mentee’s Understanding (1–5) → line graph over time.


Progress Compared to Yesterday → heatmap (green = improved, yellow = same, red = needs attention).


Stars Rating from Mentor → average star chart.


Challenges Noticed → tag cloud or list (to see recurring issues).



🔹 2. From Mentee’s Form → Track Self-Reflection
Confidence Rating (1–5) → line chart over days.


Applied or Practiced (Yes/No) → percentage pie chart.


Stars Rating for Mentor → average bar chart.


What Was Difficult / Needs More Explanation → text log for mentors to review.



🔹 3. Combined Dashboard
Consistency Streaks → GitHub-like contribution calendar (daily logs).


Level System → based on logs completed or stars earned. Example:


Level 1: 0–5 logs


Level 2: 6–15 logs


Level 3: 16–30 logs


Mentor vs Mentee Comparison


Average confidence (mentee) vs average understanding (mentor).


If both rise → progress.


If mentee confidence low but mentor says “improved” → gap spotted.


4. Login/Signup Page
Signup: choose role, enter details.


Mentor can add multiple mentees.


Mentee can only link to one mentor.


Login: email + password.

