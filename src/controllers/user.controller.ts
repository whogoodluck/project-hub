import { Request, Response } from 'express'
import * as userService from '../services/user.service'

export async function list(_req: Request, res: Response) {
  const data = await userService.getUsers()
  res.json({ success: true, data })
}

export async function get(req: Request, res: Response) {
  const data = await userService.getUser(req.params.id.toString())
  res.json({ success: true, data })
}

export async function developers(_req: Request, res: Response) {
  const data = await userService.getDevelopers()
  res.json({ success: true, data })
}

export async function update(req: Request, res: Response) {
  const data = await userService.updateUser(req.params.id.toString(), req.body)
  res.json({ success: true, data })
}
