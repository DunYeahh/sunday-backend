import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getBoards, getBoardById, saveBoards, createBoard, updateBoard, removeBoard, removeGroup, createGroup, updateGroup, createColumn, updateColumn, removeColumn,
    createTask, removeTask, addTaskUpdate, addColumnValue, updateColumnValue, removeColumnValue, moveTask } from './board.controller.js'

const router = express.Router()
router.use(log, requireAuth)

// We can add a middleware for the entire router:
// router.use(requireAuth)

////// BOARD //////
router.get('/mini', getBoards)
router.get('/:boardId', getBoardById)
router.post('/', createBoard)
router.put('/:boardId', updateBoard)
router.put('/boards/reorder', saveBoards)
router.delete('/:boardId', removeBoard)

////// GROUP //////
router.post('/:boardId/group', createGroup)
router.put('/:boardId/group/:groupId', updateGroup)
router.delete('/:boardId/group/:groupId', removeGroup)

////// COLUMN //////
router.post('/:boardId/column', createColumn)
router.put('/:boardId/column/:columnId', updateColumn)
router.delete('/:boardId/column/:columnId', removeColumn)

////// TASK //////
router.post('/:boardId/group/:groupId/task', createTask)
router.delete('/:boardId/group/:groupId/task/:taskId', removeTask)
router.post('/:boardId/group/:groupId/task/:taskId/update', addTaskUpdate)
router.put('/:boardId/group/:groupId/task/:taskId/columnValue/:colId', updateColumnValue)
router.post('/:boardId/group/:groupId/task/:taskId/columnValue/:colId', addColumnValue)
router.delete('/:boardId/group/:groupId/task/:taskId/columnValue/:colId', removeColumnValue)
router.put('/:boardId/task/:taskId', moveTask)



export const boardRoutes = router