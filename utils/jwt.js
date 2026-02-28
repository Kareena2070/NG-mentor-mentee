import jwt from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify JWT Token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Create token response object
export const createTokenResponse = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const token = generateToken(payload);

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      expertise: user.expertise || [],
      menteeEmail: user.menteeEmail || null,
      profileImage: user.profileImage || '',
      bio: user.bio || '',
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    }
  };
};