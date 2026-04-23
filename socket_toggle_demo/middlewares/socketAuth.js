const jwt = require('jsonwebtoken')

/**
 * Socket.io middleware that validates a JWT passed in the handshake.
 *
 * Client usage:
 *   const socket = io("http://localhost:3000", {
 *     auth: { token: "<your-jwt>" }
 *   });
 */

const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    if(!token){
        return next(new Error("Authentication error: no token provided"))
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    }catch{
        next(new Error("Authentication error: Invalid token"))
    }
}

module.exports = socketAuthMiddleware;