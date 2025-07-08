import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// Generate a JWT token
export function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        SECRET_KEY,
        { expiresIn: '7d' }
    );
}

// Verify a JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
}
