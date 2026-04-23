const express = require('express')
const router = require('router')

const authController = require('../controller/auth.controller')
const socketAuthMiddleware = require('../middlewares/socketAuth')
const {validateBody} = require('../middlewares/validate')

const {registerSchema, loginSchema} = require('./auth.schema');

/**
 * AUTH ROUTES
 * -----------
 * Public routes (no token needed):
 *   POST  /api/v1/auth/register  — create account
 *   POST  /api/v1/auth/login     — get tokens
 *   POST  /api/v1/auth/refresh   — rotate tokens using the cookie
 *   POST  /api/v1/auth/logout    — invalidate refresh token
 *
 * Protected route (valid access token required):
 *   GET   /api/v1/auth/me        — return logged-in user's profile
 *
 * validateBody(schema) runs Joi validation before the controller.
 * authenticate checks the Bearer token before protected routes.
 */
 