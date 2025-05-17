import { logger } from '../../services/logger.service.js'
import { boardService } from './board.service.js'

export async function getBoards(req, res) {
	const { loggedinUser } = req
	const account = loggedinUser.account || ''
	try {
		const boards = await boardService.query(account)
		res.json(boards)
	} catch (err) {
		logger.error('Failed to get boards', err)
		res.status(400).send({ err: 'Failed to get boards' })
	}
}

export async function getBoardById(req, res) {
	try {
		const { boardId } = req.params
		const board = await boardService.getById(boardId)
		res.json(board)
	} catch (err) {
		logger.error('Failed to get board', err)
		res.status(400).send({ err: 'Failed to get board' })
	}
}

export async function saveBoards(req, res) {
	const { reorderedBoards } = req.body
	try {
		const updatedBoards = await boardService.saveBoards(reorderedBoards)
		res.json(updatedBoards)
	} catch (err) {
		logger.error('Failed to update boards', err)
		res.status(400).send({ err: 'Failed to update boards' })
	}
}

export async function createBoard(req, res) {
	const { loggedinUser, body: board } = req

	try {
		const addedBoard = await boardService.add(board, loggedinUser)
		res.json(addedBoard)
	} catch (err) {
		logger.error('Failed to add board', err)
		res.status(400).send({ err: 'Failed to add board' })
	}
}

export async function updateBoard(req, res) {
	const { loggedinUser, body: board } = req
	console.log(board)
    // const { userId: _id, isAdmin } = loggedinUser

	try {
		const updatedBoard = await boardService.update(board)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to update board', err)
		res.status(400).send({ err: 'Failed to update board' })
	}
}

export async function removeBoard(req, res) {
	try {
		const { boardId } = req.params
		const removedId = await boardService.remove(boardId)

		res.status(200).json({ removedId })
	} catch (err) {
		logger.error('Failed to remove board', err)
		res.status(400).send({ err: 'Failed to remove board' })
	}
}

export async function createGroup(req, res) {
	const { loggedinUser, body } = req
	const { boardId } = req.params
	const isTop = body.isTop
	const group = body.group

	console.log(isTop, group)
	
	try {
		const updatedBoard = await boardService.createGroup(group, boardId, isTop, loggedinUser)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to add group', err)
		res.status(400).send({ err: 'Failed to add group' })
	}
}

export async function updateGroup(req, res) {
	const { loggedinUser, body: { group } } = req
	const { boardId ,groupId } = req.params
    // const { userId: _id, isAdmin } = loggedinUser

	try {
		const updatedBoard = await boardService.updateGroup(group, boardId, groupId)
		console.log(updateBoard)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to update group', err)
		res.status(400).send({ err: 'Failed to update group' })
	}
}

export async function removeGroup(req, res) {
	try {
		const { boardId, groupId } = req.params
		const removedId = await boardService.removeGroup(groupId, boardId)

		res.status(200).json({ removedId })
	} catch (err) {
		logger.error('Failed to remove group', err)
		res.status(400).send({ err: 'Failed to remove group' })
	}
}

export async function createColumn(req, res) {
	const { loggedinUser, body } = req
	const { boardId } = req.params
	const column = body.column
	
	try {
		const updatedBoard = await boardService.createColumn(column, boardId, loggedinUser)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to add column', err)
		res.status(400).send({ err: 'Failed to add column' })
	}
}

export async function updateColumn(req, res) {
	const { loggedinUser, body: { column } } = req
	const { boardId } = req.params
    // const { userId: _id, isAdmin } = loggedinUser

	try {
		const updatedBoard = await boardService.updateColumn(column, boardId)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to update column', err)
		res.status(400).send({ err: 'Failed to update column' })
	}
}

export async function removeColumn(req, res) {
	try {
		const { boardId, columnId } = req.params
		const removedId = await boardService.removeColumn(columnId, boardId)

		res.status(200).json({ removedId })
	} catch (err) {
		logger.error('Failed to remove column', err)
		res.status(400).send({ err: 'Failed to remove column' })
	}
}

export async function createTask(req, res) {
	const { loggedinUser, body } = req
	const { boardId, groupId } = req.params
	const isTop = body.isTop
	const task = body.task
	console.log('groupId: ', groupId)
	console.log('boardId: ', boardId)

	try {
		const updatedBoard = await boardService.createTask(task, boardId, groupId, isTop, loggedinUser)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to add task', err)
		res.status(400).send({ err: 'Failed to add task' })
	}
}

export async function removeTask(req, res) {
	try {
		const { boardId, groupId, taskId } = req.params
		const removedId = await boardService.removeTask(taskId, groupId, boardId)
		
		res.status(200).json({ removedId })
	} catch (err) {
		logger.error('Failed to remove task', err)
		res.status(400).send({ err: 'Failed to remove task' })
	}
}

export async function addTaskUpdate(req, res) {
	const { loggedinUser, body } = req
	const { boardId, groupId, taskId } = req.params
	const update = body.update
	console.log('boardId: ', boardId)
	console.log('groupId: ', groupId)
	console.log('taskId: ', taskId)
	console.log('update: ', update)

	try {
		const updatedBoard = await boardService.addTaskUpdate(update, boardId, groupId, taskId)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to send update', err)
		res.status(400).send({ err: 'Failed to send update' })
	}
}

export async function addColumnValue(req, res) {
	const { loggedinUser, body } = req
	const { boardId, groupId, taskId, colId } = req.params
	const value = body.value

	try {
		const updatedBoard = await boardService.addColumnValue(value, boardId, groupId, taskId, colId)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to add column value', err)
		res.status(400).send({ err: 'Failed to add column value' })
	}
}

export async function updateColumnValue(req, res) {
	const { loggedinUser, body } = req
	const { boardId, groupId,taskId, colId } = req.params
	const value = body.value

	try {
		const updatedBoard = await boardService.updateColumnValue(value, boardId, groupId, taskId, colId)
		res.json(updatedBoard)
	} catch (err) {
		logger.error('Failed to update column value', err)
		res.status(400).send({ err: 'Failed to update column value' })
	}
}

export async function removeColumnValue(req, res) {

	const { loggedinUser, body } = req
	const { boardId, groupId, taskId, colId } = req.params

	try {
		const removedId = await boardService.removeColumnValue(boardId, groupId, taskId, colId)
		res.status(200).json({ removedId })
	} catch (err) {
		logger.error('Failed to remove column value', err)
		res.status(400).send({ err: 'Failed to remove column value' })
	}
}