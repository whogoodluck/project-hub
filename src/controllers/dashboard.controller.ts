import { Request, Response } from 'express'
import { getDashboard } from '../services/dashboard.service'

export async function get(req: Request, res: Response) {
  const { id: userId, role } = req.user!
  const data = await getDashboard(userId, role)
  res.json({ success: true, data })
}
