require('dotenv').config();

const http = require("http")
const app = require("./app")
const {initSocket} = require('./src/socket')

const logger = require('./utils/logger')

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = initSocket(server);

app.set("io", io) // Make socket.io accessible in Express routes via req.app.get("io")

server.listen(PORT, ()=>{
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`)
    logger.info('Socket.io ready')
})

io.on('connection', (socket)=>{
    console.log('client connected:', socket.id)

    socket.on('toggle-changed', (data)=>{
        console.log('Toggle event received', data)
        // data = {id: toggle-1, checked: true/false}

        const processed = {
            ...data,

            processedAt: new Date().toISOString(),
            from: socket.id
        }


        socket.broadcast.emit('toggle-changed', processed)
    })

    socket.on('disconnect', ()=>{
        console.log('Client disconnected: ', socket.id)
    })
})


const shutdown = (signal) => {
    logger.info(`${signal} received . shutting down gracefully`)
    io.close(()=>logger.info("Socket.io closed"))
    server.close(()=>{
        logger.info("HTTP server closed")
        process.exit(0);
    })

    setTimeout(()=>{
        logger.error('Forced shutdown after timeout');
        process.exit(1);

    }, 10000);
    
}

process.on("SIGTERM", ()=>shutdown("SIGTERM"))
process.on("SIGINT", ()=>shutdown("SIGINT"));
process.on("unhandledRejection", (err)=>{
    logger.error("Unhandled rejection", err);
    shutdown("unhandled rejection")
})