import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
	signup,
	login,
	getLoginToken,
	validateToken,
	googleLogin,
}

async function login(email, password) {
	logger.debug(`auth.service - login with email: ${email}`)

	const user = await userService.getByEmail(email)
	if (!user) return Promise.reject('Invalid email or password')

	// TODO: un-comment for real login
	// const match = await bcrypt.compare(password, user.password)
	// if (!match) return Promise.reject('Invalid email or password')

	delete user.password
	user._id = user._id.toString()
	return user
}


async function googleLogin(credentials) {
	const {
		email,
		firstName,
		lastName,
		profileImg,
	} = credentials

	logger.debug(`auth.service - google login with email: ${email}`)

	let user = await userService.getByEmail(email)
	if (!user) {
		user = await userService.add({
			email,
			firstName,
			lastName,
			profileImg,
			role: 'user',
			isGoogleUser: true
		})
	}

	console.log("user: ", user)

	delete user.password
	user._id = user._id.toString()
	return user
}

async function signup(email, firstName, lastName, profileImg, password, role, isGoogleUser) {
	const saltRounds = 10

	logger.debug(`auth.service - signup with email: ${email}, fullname: ${firstName} ${lastName}`)
	if (!email || (!password || isGoogleUser) || !firstName || !lastName) return Promise.reject('Missing required signup information')

	const userExist = await userService.getByEmail(email)
	if (userExist) return Promise.reject('Email already taken')

	const hash = await bcrypt.hash(password, saltRounds)
	return userService.add({ email, password: hash, firstName, lastName, profileImg, role, isGoogleUser })
}

function getLoginToken(user) {
	const userInfo = {
		_id: user._id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		account: user.account,
		isAdmin: user.isAdmin,
	}
	return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
	try {
		const json = cryptr.decrypt(loginToken)
		const loggedinUser = JSON.parse(json)
		return loggedinUser
	} catch (err) {
		console.log('Invalid login token')
	}
	return null
}