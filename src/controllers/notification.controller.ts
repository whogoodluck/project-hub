import { Request, Response } from 'express'
import * as notifService from '../services/notification.service'

export async function list(req: Request, res: Response) {
  const data = await notifService.getNotifications(req.user!.sub)
  res.json({ success: true, data })
}

export async function unreadCount(req: Request, res: Response) {
  const count = await notifService.getUnreadCount(req.user!.sub)
  res.json({ success: true, data: { count } })
}

export async function markOne(req: Request, res: Response) {
  await notifService.markRead(req.params.id.toString(), req.user!.sub)
  res.json({ success: true })
}

export async function markAll(req: Request, res: Response) {
  await notifService.markAllRead(req.user!.sub)
  res.json({ success: true })
}
