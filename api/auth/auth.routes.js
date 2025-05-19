import express from 'express'

import { login, signup, logout, googleAuth } from './auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.post('/google', googleAuth)

export const authRoutes = router