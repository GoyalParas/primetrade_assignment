const authService = require('./auth.service');
const { successResponse } = require('../../utils/apiResponse');

// Helper to configure refresh token cookie options
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token lifespan
  };
};

const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    
    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    successResponse(res, 'User registered successfully', { user, accessToken }, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    successResponse(res, 'User logged in successfully', { user, accessToken }, 200);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    // Get refresh token from cookie first, fallback to request body
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    const { accessToken, refreshToken, user } = await authService.refresh(token);

    // Rotate refresh token cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    successResponse(res, 'Token refreshed successfully', { user, accessToken }, 200);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    successResponse(res, 'User logged out successfully', {}, 200);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is already populated by auth middleware
    successResponse(res, 'User profile retrieved successfully', { user: req.user }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
