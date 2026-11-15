const express = require('express');
const memberController = require('./member.controller');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
} = require('./member.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.post('/register', validate(validateRegister), asyncHandler(memberController.register));
router.post('/login', validate(validateLogin), asyncHandler(memberController.login));
router.get('/me', authenticate, asyncHandler(memberController.getProfile));
router.put('/me', authenticate, validate(validateUpdateProfile), asyncHandler(memberController.updateProfile));
router.put('/change-password', authenticate, validate(validateChangePassword), asyncHandler(memberController.changePassword));
router.post('/logout', authenticate, asyncHandler(memberController.logout));

module.exports = router;
