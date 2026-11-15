const memberService = require('./member.service');

class MemberController {
  async register(req, res) {
    const { username, email, password } = req.body;
    const user = await memberService.register({ username, email, password });
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: user,
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const result = await memberService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }

  async getProfile(req, res) {
    const user = await memberService.getProfile(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    });
  }

  async updateProfile(req, res) {
    const { username, email } = req.body;
    const user = await memberService.updateProfile(req.user.userId, { username, email });
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const result = await memberService.changePassword(req.user.userId, {
      currentPassword,
      newPassword,
    });
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: result,
    });
  }

  async logout(req, res) {
    const result = await memberService.logout();
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: result,
    });
  }
}

module.exports = new MemberController();
