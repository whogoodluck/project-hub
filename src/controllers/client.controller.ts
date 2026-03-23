import { Request, Response } from 'express'
import * as clientService from '../services/client.service'

export async function list(_req: Request, res: Response) {
  const data = await clientService.getClients()
  res.json({ success: true, data })
}

export async function get(req: Request, res: Response) {
  const data = await clientService.getClient(req.params.id.toString())
  res.json({ success: true, data })
}

export async function create(req: Request, res: Response) {
  const data = await clientService.createClient(req.body)
  res.status(201).json({ success: true, data })
}

export async function update(req: Request, res: Response) {
  const data = await clientService.updateClient(req.params.id.toString(), req.body)
  res.json({ success: true, data })
}

export async function remove(req: Request, res: Response) {
  await clientService.deleteClient(req.params.id.toString())
  res.json({ success: true, message: 'Client deleted' })
}
