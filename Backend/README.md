# NG Mentor-Mentee Backend

A robust Node.js/Express backend API for the NavGurukul Mentor-Mentee platform, supporting role-based authentication and mentorship management.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access** - Support for mentor and mentee roles
- 🗄️ **MongoDB Integration** - Mongoose ODM for data modeling
- ✅ **Input Validation** - Express-validator for request validation
- 🛡️ **Security** - Password hashing with bcrypt, CORS protection
- 📊 **User Management** - Profile management, search, and statistics
- 🚀 **RESTful API** - Clean and intuitive API endpoints

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update values:
   ```bash
   # Update .env with your configurations
   MONGODB_URI=mongodb://localhost:27017/ng-mentor-mentee
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   - Local: `mongod` or start MongoDB service
   - Atlas: Ensure connection string is correct in `.env`

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation**
   ```bash
   curl http://localhost:5000/api/health
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/logout` | Logout user | Private |
| GET | `/verify-token` | Verify JWT token | Private |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update profile | Private |
| GET | `/mentors` | Get all mentors | Private |
| GET | `/mentees` | Get all mentees | Private (Mentor) |
| GET | `/search` | Search users | Private |
| GET | `/stats` | User statistics | Private |
| GET | `/:id` | Get user by ID | Private |
| DELETE | `/account` | Deactivate account | Private |

## Request/Response Examples

### Register User
```javascript
POST /api/auth/register
Content-Type: application/json

// Mentee Registration
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "mentee"
}

// Mentor Registration  
{
  "name": "Jane Smith",
  "email": "jane@example.com", 
  "password": "password123",
  "role": "mentor",
  "menteeEmail": "mentee@example.com",
  "expertise": ["React", "Node.js", "MongoDB"]
}
```

### Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mentee",
    // ... other user fields
  }
}
```

### Protected Route Usage
```javascript
// Include JWT token in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

GET /api/users/profile
```

## Data Models

### User Schema
```javascript
{
  name: String,           // Required
  email: String,          // Unique, required
  password: String,       // Hashed, required
  role: String,           // 'mentor' or 'mentee'
  
  // Mentor-specific fields
  expertise: [String],    // Array of skills
  menteeEmail: String,    // Associated mentee email
  
  // Profile fields
  bio: String,
  profileImage: String,
  
  // System fields
  isActive: Boolean,
  isEmailVerified: Boolean,
  lastLogin: Date,
  loginCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ng-mentor-mentee |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | Token expiration | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## Error Handling

The API uses consistent error response format:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [...]  // Optional validation errors
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Stateless authentication
- **Input Validation** - express-validator middleware
- **CORS Protection** - Configured for frontend domain
- **Rate Limiting** - (Recommended for production)
- **Helmet** - (Recommended for production security headers)

## Development

### Project Structure
```
Backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── validation.js       # Input validation rules
│   └── errorHandler.js     # Global error handling
├── models/
│   └── User.js             # User data model
├── routes/
│   ├── auth.js             # Authentication routes
│   └── users.js            # User management routes
├── utils/
│   └── jwt.js              # JWT utilities
├── .env                    # Environment variables
├── package.json
└── server.js               # Main application file
```

### Running Tests (Future Enhancement)
```bash
# Unit tests
npm test

# Integration tests  
npm run test:integration

# Coverage report
npm run test:coverage
```

## Deployment

### Production Considerations

1. **Environment Variables**
   - Use strong JWT secrets
   - Set production MongoDB URI
   - Configure proper CORS origins

2. **Security Enhancements**
   ```bash
   npm install helmet express-rate-limit
   ```

3. **Process Management** 
   ```bash
   npm install -g pm2
   pm2 start server.js --name ng-backend
   ```

4. **Database**
   - Use MongoDB Atlas for cloud hosting
   - Implement proper indexing
   - Set up regular backups

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header format

3. **CORS Errors**
   - Update FRONTEND_URL in `.env`
   - Check frontend is running on correct port

4. **Validation Errors**
   - Review API documentation for required fields
   - Check data types and formats

## API Documentation

For detailed API documentation with interactive examples, consider integrating:
- Swagger/OpenAPI documentation
- Postman collection
- Insomnia workspace

## Contributing

1. Follow existing code style and structure
2. Add appropriate validation and error handling
3. Update documentation for new features
4. Test thoroughly before submitting PRs

## Support

For issues and questions:
- Check existing GitHub issues
- Review logs for error details
- Ensure all dependencies are installed correctly

---

**Made with ❤️ for NavGurukul Community**