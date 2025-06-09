import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'
import { makeId } from '../../services/util.service.js'

export const userService = {
	add, 
	getById, 
	update, 
	remove, 
	query, 
	getByEmail, 
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        let users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            user.lastViewedBoards?.sort((a, b) => b.viewedAt - a.viewedAt)
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {//filter last visited boards based on date
    try {

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
        if (!user) throw new Error('User not found')
        delete user.password

        
        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByEmail(email) {
	try {
		const collection = await dbService.getCollection('user')
		return await collection.findOne({ email })
	} catch (err) {
		logger.error(`while finding user by email: ${email}`, err)
		throw err
	}
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')

        await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(viewedBoardId, userId) {
    
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
        if (!user) throw new Error('User not found')

        let lastViewedBoards = user.lastViewedBoards || []

        lastViewedBoards = lastViewedBoards.filter(b => b.boardId !== viewedBoardId)

		lastViewedBoards.unshift({
			boardId: viewedBoardId,
			viewedAt: Date.now(),
		})

        await collection.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: { lastViewedBoards } })
 
		delete user.password
		user.lastViewedBoards = lastViewedBoards
        return user
    } catch (err) {
        logger.error(`cannot update user ${userId}`, err)
        throw err
    }
}

async function add(user) {

    logger.debug(`user.service - add user: ${user.email}`)
    
    try {
		const userToAdd = {
            account: user.account || makeId(),
			email: user.email,
			password: user.password || undefined,
			firstName: user.firstName,
			lastName: user.lastName,
			profileImg: user.profileImg || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0D8ABC&color=fff&length=2&rounded=true&bold=true`,
			role: user.role || 'user',
            isGoogleUser: user.isGoogleUser || false,
            lastViewedBoards: []
		}

		const collection = await dbService.getCollection('user')
		await collection.insertOne(userToAdd)

		return userToAdd
	} catch (err) {
		logger.error('cannot add user', err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const criteria = {}
	if (filterBy.accountId) {
		criteria.accountId = filterBy.accountId
	}

	return criteria
}