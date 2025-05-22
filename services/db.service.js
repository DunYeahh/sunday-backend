import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = { getCollection }

var dbConn = null

async function getCollection(collectionName) {
	try {
		const db = await _connect()
		const collection = await db.collection(collectionName)
		return collection
	} catch (err) {
		logger.error('Failed to get Mongo collection', err)
		throw err
	}
}

async function _connect() {
	if (dbConn) return dbConn
    
	try {
		const client = await MongoClient.connect(config.dbURL)
		// const client = await MongoClient.connect('mongodb://localhost:27017')
		return dbConn = client.db('boardDB')
	} catch (err) {
		logger.error('Cannot Connect to DB', err)
		throw err
	}
}