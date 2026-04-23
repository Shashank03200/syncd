const Joi = require('joi')

/**
 * 
 * Validation schemas
 * 
 * Joi validates the request body before it reaches the controller.
 * If validation fails, a 400 error is returned immediately
 * with a clear message- the controller never even runs.
 * 
 */

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.min": "Name must be at least 2 characters",
        "any.required": "Name is required",
    }),
    email: Joi.string().email().lowercase().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/).required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base": "Password must contain an uppercase letter, a number, and a symbol",
      "any.required": "Password is required",
    })

})

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});


module.exports = { registerSchema, loginSchema };