import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  clientId: z.string().uuid(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  isArchived: z.boolean().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
