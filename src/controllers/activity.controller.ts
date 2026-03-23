import { Request, Response } from 'express'
import { getMissedLogs } from '../services/activity.service'

export async function getFeed(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  const projectId = req.query.projectId as string | undefined
  const data = await getMissedLogs({ userId, role, projectId })
  res.json({ success: true, data })
}
