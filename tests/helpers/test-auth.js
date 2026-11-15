const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../src/lib/prisma');
const env = require('../../src/config/env');

const generateToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '1h' });
};

const getAdminTestToken = async () => {
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash('AdminPassword123', 10);
    admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
  }

  return generateToken({
    userId: admin.id,
    role: admin.role,
    username: admin.username,
    email: admin.email,
  });
};

const getMemberTestToken = async (username = 'foodlover', email = 'foodlover@example.com') => {
  let member = await prisma.user.findUnique({
    where: { email },
  });

  if (!member) {
    const passwordHash = await bcrypt.hash('StrongPassword123', 10);
    member = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'MEMBER',
      },
    });
  }

  return generateToken({
    userId: member.id,
    role: member.role,
    username: member.username,
    email: member.email,
  });
};

const createTestUser = async ({ username, email, role = 'MEMBER', password = 'Password123' }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role,
    },
  });

  const token = generateToken({
    userId: user.id,
    role: user.role,
    username: user.username,
    email: user.email,
  });

  return { user, token };
};

module.exports = {
  generateToken,
  getAdminTestToken,
  getMemberTestToken,
  createTestUser,
};
