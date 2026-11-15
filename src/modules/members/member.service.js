const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../lib/prisma');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');

class MemberService {
  async register({ username, email, password }) {
    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw ApiError.conflict('Username is already taken', 'DUPLICATE_USERNAME');
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw ApiError.conflict('Email is already registered', 'DUPLICATE_EMAIL');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with role MEMBER always
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'MEMBER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return user;
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const payload = {
      userId: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async updateProfile(userId, { username, email }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check unique username if changed
    if (username && username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username },
      });
      if (existing) {
        throw ApiError.conflict('Username is already taken', 'DUPLICATE_USERNAME');
      }
    }

    // Check unique email if changed
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing) {
        throw ApiError.conflict('Email is already registered', 'DUPLICATE_EMAIL');
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return updatedUser;
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect', 'INVALID_PASSWORD');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return { id: user.id };
  }

  async logout() {
    return null;
  }
}

module.exports = new MemberService();
