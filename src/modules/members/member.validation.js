const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRegister = (req) => {
  const errors = [];
  const { username, email, password } = req.body || {};

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push({ field: 'username', message: 'username is required' });
  } else if (username.length < 3 || username.length > 50) {
    errors.push({ field: 'username', message: 'username must be between 3 and 50 characters' });
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'email must be a valid email address' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'password must be at least 6 characters' });
  }

  return errors;
};

const validateLogin = (req) => {
  const errors = [];
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'email must be a valid email address' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'password is required' });
  }

  return errors;
};

const validateUpdateProfile = (req) => {
  const errors = [];
  const { username, email } = req.body || {};

  if (!username && !email) {
    errors.push({ field: 'body', message: 'At least one of username or email is required' });
  }

  if (username !== undefined) {
    if (typeof username !== 'string' || username.trim().length === 0) {
      errors.push({ field: 'username', message: 'username cannot be empty' });
    } else if (username.length < 3 || username.length > 50) {
      errors.push({ field: 'username', message: 'username must be between 3 and 50 characters' });
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      errors.push({ field: 'email', message: 'email cannot be empty' });
    } else if (!validateEmail(email)) {
      errors.push({ field: 'email', message: 'email must be a valid email address' });
    }
  }

  return errors;
};

const validateChangePassword = (req) => {
  const errors = [];
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.length === 0) {
    errors.push({ field: 'currentPassword', message: 'currentPassword is required' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length === 0) {
    errors.push({ field: 'newPassword', message: 'newPassword is required' });
  } else if (newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'newPassword must be at least 6 characters' });
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
