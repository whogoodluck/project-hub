export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER'
export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'OVERDUE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_IN_REVIEW'
  | 'TASK_STATUS_CHANGED'
  | 'GENERAL'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  isActive?: boolean
  createdAt?: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  clientId: string
  client: { id: string; name: string; company?: string }
  managerId: string
  manager: { id: string; name: string; email: string }
  isArchived: boolean
  createdAt: string
  updatedAt: string
  _count?: { tasks: number }
}

export interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  project: { id: string; name: string; managerId: string }
  assigneeId?: string
  assignee?: { id: string; name: string; email: string }
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  isOverdue: boolean
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  projectId: string
  taskId?: string
  task?: { id: string; title: string }
  actorId: string
  actor: { id: string; name: string; role?: string }
  message: string
  affectedAssigneeId?: string
  fromStatus?: TaskStatus
  toStatus?: TaskStatus
  createdAt: string
}

export interface Notification {
  id: string
  recipientId: string
  taskId?: string
  task?: { id: string; title: string; projectId: string }
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
}

export interface AdminDashboard {
  totalProjects: number
  tasksByStatus: Partial<Record<TaskStatus, number>>
  overdueCount: number
  onlineCount: number
}

export interface PmDashboard {
  projects: (Project & {
    tasks: Pick<Task, 'status' | 'priority' | 'dueDate' | 'title' | 'id'>[]
  })[]
  tasksByPriority: Partial<Record<TaskPriority, number>>
  upcomingThisWeek: Pick<
    Task,
    'id' | 'title' | 'status' | 'priority' | 'dueDate'
  >[]
}

export interface DeveloperDashboard {
  tasks: (Task & { project: { id: string; name: string } })[]
  byStatus: Partial<Record<TaskStatus, number>>
}
