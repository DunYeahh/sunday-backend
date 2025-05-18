import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import detect from 'detect-port';

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { boardRoutes } from './api/board/board.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [   'http://127.0.0.1:3000',
                    'http://localhost:3000',
                    'http://127.0.0.1:5173',
                    'http://localhost:5173',
                    'http://127.0.0.1:5174',
                    'http://localhost:5174',
                    'http://127.0.0.1:5175',
                    'http://localhost:5175'
                ],
        credentials: true
    }
    app.use(cors(corsOptions))
}
app.all('*all', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/board', boardRoutes)

setupSocketAPI(server)

// Make every unhandled server-side-route match index.html
// so when requesting http://localhost:3030/unhandled-route... 
// it will still serve the index.html file
// and allow vue/react-router to take it from there

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

import { logger } from './services/logger.service.js'

const desiredPort = process.env.PORT || 3030;
const port = await detect(desiredPort === 3030 ? 3030 : Number(desiredPort));

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})