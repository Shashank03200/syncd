const bcrypt = require('bcrypt')
const AppError = require('../utils/AppError')
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} = require("../utils/token")


// In memory user store
const users = []
let nextId = 1;

// ─── In-memory refresh token store (replace with DB or Redis) ─────────────────
// We store issued refresh tokens so we can invalidate them on logout.
// In production, use Redis or a DB table for this.

const refreshTokenStore = new Set();

async function register({name, email, password}){
    const existing = users.find((u) => u.email === email)
    if(existing) throw new AppError("Email already in use", 409)

    // bcrypt.hash(password, saltRounds)
    // saltRounds = 12 

    const passwordHash =  await bcrypt.hash(password, 12);
    const user = { id: nextId++, name, email, passwordHash, createdAt: new Date().toISOString() };

    users.push(user);
    return _issueTokens(user);
}


async function login({email, password}){

    const user = users.find((u)=>u.email === email);

    // We hash a dummy string even when the user is not found so that the
  // response time is the same whether or not the email exists. This prevents
  // attackers from enumerating valid emails via timing differences.
    const hash = user?.passwordHash || "$2a$12$dummyhashfordummycomparison00000000000";
    const valid = await bcrypt.compare(password, hash);

    if(!user || !valid)
        throw new AppError("Invalid email or password", 401);

    return _issueTokens(user);


}

/**
 * REFRESH
 * Called when the access token has expired. The client sends its refresh
 * token (from the httpOnly cookie) and we issue a brand-new pair of tokens.
 *
 * We also rotate the refresh token — the old one is removed from the store
 * and a new one is issued. This limits the damage if a refresh token is
 * ever stolen: it can only be used once.
 */

async function refresh(refreshToken) {
  if (!refreshToken || !refreshTokenStore.has(refreshToken)) {
    throw new AppError("Invalid or expired refresh token", 401);
  }
 
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    refreshTokenStore.delete(refreshToken); // token is expired or tampered
    throw new AppError("Invalid or expired refresh token", 401);
  }
 
  const user = users.find((u) => u.id === decoded.id);
  if (!user) throw new AppError("User not found", 401);
 
  // Rotate: invalidate the old refresh token
  refreshTokenStore.delete(refreshToken);
 
  return _issueTokens(user);
}

 
/**
 * LOGOUT
 * Removes the refresh token from our store so it can never be used again.
 * The client is responsible for discarding the access token on its end
 * (e.g. clearing it from memory / localStorage).
 */
async function logout(refreshToken) {
  refreshTokenStore.delete(refreshToken);
}


function _issueToken(user){
    const payload = { id: user.id, email: user.email, name: user.name };

    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Persist the refresh token so we can validate (and revoke) it later
    refreshTokenStore.add(refreshToken);

    const { passwordHash, ...safeUser } = user; // strip sensitive fields
    return { accessToken, refreshToken, user: safeUser };

}

module.exports = { register, login, refresh, logout };