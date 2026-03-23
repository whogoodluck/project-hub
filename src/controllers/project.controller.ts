import { Request, Response } from 'express'
import * as projectService from '../services/project.service'

export async function list(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  const data = await projectService.getProjects(userId, role)
  res.json({ success: true, data })
}

export async function get(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  const data = await projectService.getProject(req.params.id.toString(), userId, role)
  res.json({ success: true, data })
}

export async function create(req: Request, res: Response) {
  const { id: userId } = req.user!
  const data = await projectService.createProject(req.body, userId)
  res.status(201).json({ success: true, data })
}

export async function update(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  const data = await projectService.updateProject(req.params.id.toString(), req.body, userId, role)
  res.json({ success: true, data })
}

export async function remove(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  await projectService.deleteProject(req.params.id.toString(), userId, role)
  res.json({ success: true, message: 'Project deleted' })
}
