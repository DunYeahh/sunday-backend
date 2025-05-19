import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'
import { OAuth2Client } from 'google-auth-library'

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const client = new OAuth2Client('198663761522-osnjd48065j34p2k59162s0hg0trvvp9.apps.googleusercontent.com')

export async function login(req, res) {
	const { email, password } = req.body
	try {
		const user = await authService.login(email, password)
		const loginToken = authService.getLoginToken(user)

		logger.info('User login: ', user)

		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
		res.json(user)
	} catch (err) {
		logger.error('Failed to Login ' + err)
		res.status(401).send({ err: 'Failed to Login' })
	}
}

export async function googleAuth(req, res) {
	const { idToken } = req.body
	try {
		if (!idToken) throw new Error('No ID token provided')

		const ticket = await client.verifyIdToken({
			idToken,
			// audience: process.env.GOOGLE_CLIENT_ID,
			audience: '198663761522-osnjd48065j34p2k59162s0hg0trvvp9.apps.googleusercontent.com',
		})

		const payload = ticket.getPayload()
		const { email, given_name, family_name, picture } = payload


		const user = await authService.googleLogin({
			email,
			firstName: given_name,
			lastName: family_name,
			profileImg: picture,
		})

		const loginToken = authService.getLoginToken(user)
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
		res.json(user)

	} catch (err) {
		logger.error('Google login failed:', err)
		res.status(401).send({ err: 'Google authentication failed' })
	}

}

export async function signup(req, res) {
	try {
		const { email, firstName, lastName, profileImg, password, role } = req.body

		// Never log passwords
		// logger.debug( email, firstName, lastName,profileImg, password, role )

		const account = await authService.signup(email, firstName, lastName, profileImg, password, role)
		logger.debug(`auth.route - new account created: ` + JSON.stringify(account))

		const user = await authService.login(email, password)
		logger.info('User signup:', user)

		const loginToken = authService.getLoginToken(user)
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
		res.json(user)
	} catch (err) {
		logger.error('Failed to signup ' + err)
		res.status(400).send({ err: 'Failed to signup' })
	}
}

export async function logout(req, res) {
	try {
		res.clearCookie('loginToken')
		res.send({ msg: 'Logged out successfully' })
	} catch (err) {
		res.status(400).send({ err: 'Failed to logout' })
	}
}