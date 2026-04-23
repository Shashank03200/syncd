const jwt = require("jsonwebtoken");
const { clear } = require("winston");
 
/**
 * TOKEN UTILITY
 * -------------
 * We issue two tokens:
 *
 * 1. ACCESS TOKEN  — short-lived (15 min). Sent with every API request in the
 *    Authorization header. Because it expires quickly, a stolen token has a
 *    small window of abuse.
 *
 * 2. REFRESH TOKEN — long-lived (7 days). Stored in an httpOnly cookie on the
 *    client (never readable by JS). Used only to get a new access token when
 *    the current one expires. This way the user stays "logged in" without us
 *    having to make access tokens long-lived.
 */
 
const ACCESS_TOKEN_SECRET  = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
 
const ACCESS_TOKEN_EXPIRY  = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";


/**
 * Signs and returns a short-lived access token.
 * The payload carries only what downstream code needs (id, email, role).
 * Never put sensitive data (passwords, credit cards) in a JWT payload —
 * the payload is base64-encoded, NOT encrypted; anyone can decode it.
 */
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}


/**
 * Signs and returns a long-lived refresh token.
 * We keep the payload minimal (just the user id) to limit exposure.
 */
function signRefreshToken(payload) {
  return jwt.sign({ id: payload.id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verifies an access token and returns its decoded payload.
 * Throws a JsonWebTokenError if the token is invalid or expired.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

/**
 * Verifies a refresh token and returns its decoded payload.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

/**
 * Sets the refresh token as a secure httpOnly cookie on the response.
 * 
 * httpOnly -> the browser canot read this cookie via document.cookie or JS.
 * This prevents XSS attacks from stealing the refresh token.
 * 
 * secure - => cookie is only sent over HTTPS.
 * sameSite -> strict: prevents the cookie from being sent on cross-site requests, blocking CSRF attacks
 */

function setRefreshTokenCookie(res, token){
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 100
    })
}


function clearRefreshTokenCookie(res){
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
    })
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    setRefreshTokenCookie,
    clearRefreshTokenCookie
}