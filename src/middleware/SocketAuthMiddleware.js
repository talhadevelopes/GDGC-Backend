import jwt from 'jsonwebtoken'

const SocketAuthMiddleware = (socket, next) => {
    // Get token from headers
    const token = socket.handshake.headers.authorization?.split(" ")[1];
    if(!token) {
        return next(new Error('Token not found'))
    }

    try {
        // Verifying the token and attaching to socket's data
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.data.userId = decoded?.id;
        next()
    } catch (error) {
        next(error)
    }
}

export default SocketAuthMiddleware