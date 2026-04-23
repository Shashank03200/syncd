const authService = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler.js')
const {setRefreshTokenCookie, clearRefreshTokenCookie} = require('../utils/token')


const AppError = require('../utils/AppError')

/**
 * AUTH CONTROLLER
 * ---------------
 * The controller's only job is to handle HTTP concerns:
 *   - Read from req (body, cookies, headers)
 *   - Call the service with clean data
 *   - Write the response (status code, JSON body, cookies)
 *
 * It delegates ALL business logic to auth.service.js.
 */
 
/**
 * POST /api/v1/auth/register
 *
 * Registers a new user and immediately logs them in by returning tokens.
 * The refresh token is set as a secure httpOnly cookie — not in the JSON body —
 * so client-side JS can never read or steal it.
 */
const register = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.register(req.body);
 
  setRefreshTokenCookie(res, refreshToken);
 
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { accessToken, user },
    // refreshToken is NOT included here — it lives in the httpOnly cookie
  });
});
 
/**
 * POST /api/v1/auth/login
 *
 * Authenticates credentials and returns a new token pair.
 * Same cookie strategy as register.
 */
const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
 
  setRefreshTokenCookie(res, refreshToken);
 
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { accessToken, user },
  });
});

/**
 * POST /api/v1/auth/refresh
 *
 * Issues a new access token (and rotates the refresh token) using the
 * refresh token found in the httpOnly cookie.
 *
 * The client should call this endpoint whenever an API request returns 401,
 * then retry the original request with the new access token.
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new AppError("No refresh token provided", 401);
 
  const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(refreshToken);
 
  // Rotate the cookie with the new refresh token
  setRefreshTokenCookie(res, newRefreshToken);
 
  res.status(200).json({
    success: true,
    data: { accessToken, user },
  });
});

/**
 * POST /api/v1/auth/logout
 *
 * Invalidates the refresh token server-side and clears the cookie.
 * After this, neither token can be used — the user must log in again.
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logout(refreshToken);
 
  clearRefreshTokenCookie(res);
 
  res.status(200).json({ success: true, message: "Logged out successfully" });
});


/**
 * GET /api/v1/auth/me
 *
 * Returns the currently authenticated user's profile.
 * Protected by the `authenticate` middleware, which validates the access token
 * and attaches the decoded payload to req.user before this runs.
 */
const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = { register, login, refresh, logout, me };