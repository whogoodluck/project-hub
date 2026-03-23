import { Request, Response } from 'express'
import * as taskService from '../services/task.service'
import { getIo } from '../sockets/io'
import { taskFilterSchema } from '../validators/task.validator'

export async function list(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  const filters = taskFilterSchema.parse(req.query)
  const data = await taskService.getTasks(req.params.projectId.toString(), userId, role, filters)
  res.json({ success: true, ...data })
}

export async function get(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  const data = await taskService.getTask(req.params.taskId.toString(), userId, role)
  res.json({ success: true, data })
}

export async function create(req: Request, res: Response) {
  const actor = req.user!
  const { task, log } = await taskService.createTask(
    req.params.projectId.toString(),
    req.body,
    actor
  )

  getIo().to(`project:${task.projectId}`).emit('activity:new', { log, projectId: task.projectId })

  res.status(201).json({ success: true, data: task })
}

export async function update(req: Request, res: Response) {
  const actor = req.user!
  const { task, log } = await taskService.updateTask(req.params.taskId.toString(), req.body, actor)

  getIo().to(`project:${task.projectId}`).emit('activity:new', { log, projectId: task.projectId })

  res.json({ success: true, data: task })
}

export async function updateStatus(req: Request, res: Response) {
  const actor = req.user!
  const { task, log } = await taskService.updateTaskStatus(
    req.params.taskId.toString(),
    req.body,
    actor
  )

  if (log) {
    const io = getIo()
    io.to(`project:${task.projectId}`).emit('activity:new', {
      log,
      projectId: task.projectId,
    })

    if (task.assigneeId) {
      io.to(`user:${task.assigneeId}`).emit('notification:new')
    }
    if (task.project.managerId) {
      io.to(`user:${task.project.managerId}`).emit('notification:new')
    }
  }

  res.json({ success: true, data: task })
}

export async function remove(req: Request, res: Response) {
  const actor = req.user!
  await taskService.deleteTask(req.params.taskId.toString(), actor)
  res.json({ success: true, message: 'Task deleted' })
}
