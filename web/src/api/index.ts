import api from '@/lib/api'
import type {
  AdminDashboard,
  Client,
  DeveloperDashboard,
  Notification,
  PmDashboard,
  Project,
  Task,
  User,
} from '@/types'

// --- Clients ---
export const clientsApi = {
  list: () =>
    api
      .get<{ success: true; data: Client[] }>('/clients')
      .then((r) => r.data.data),
  get: (id: string) =>
    api
      .get<{ success: true; data: Client }>(`/clients/${id}`)
      .then((r) => r.data.data),
  create: (data: {
    name: string
    email?: string
    phone?: string
    company?: string
  }) =>
    api
      .post<{ success: true; data: Client }>('/clients', data)
      .then((r) => r.data.data),
  update: (
    id: string,
    data: Partial<{
      name: string
      email: string
      phone: string
      company: string
    }>
  ) =>
    api
      .patch<{ success: true; data: Client }>(`/clients/${id}`, data)
      .then((r) => r.data.data),
  remove: (id: string) => api.delete(`/clients/${id}`),
}

// --- Projects ---
export const projectsApi = {
  list: () =>
    api
      .get<{ success: true; data: Project[] }>('/projects')
      .then((r) => r.data.data),
  get: (id: string) =>
    api
      .get<{ success: true; data: Project }>(`/projects/${id}`)
      .then((r) => r.data.data),
  create: (data: { name: string; description?: string; clientId: string }) =>
    api
      .post<{ success: true; data: Project }>('/projects', data)
      .then((r) => r.data.data),
  update: (
    id: string,
    data: { name?: string; description?: string; isArchived?: boolean }
  ) =>
    api
      .patch<{ success: true; data: Project }>(`/projects/${id}`, data)
      .then((r) => r.data.data),
  remove: (id: string) => api.delete(`/projects/${id}`),
}

// --- Tasks ---
export type TaskFilters = {
  status?: string
  priority?: string
  dueDateFrom?: string
  dueDateTo?: string
  page?: number
  limit?: number
}

export const tasksApi = {
  list: (projectId: string, filters?: TaskFilters) =>
    api
      .get<{
        success: true
        tasks: Task[]
        total: number
        page: number
        limit: number
      }>(`/projects/${projectId}/tasks`, { params: filters })
      .then((r) => r.data),
  get: (projectId: string, taskId: string) =>
    api
      .get<{
        success: true
        data: Task
      }>(`/projects/${projectId}/tasks/${taskId}`)
      .then((r) => r.data.data),
  create: (
    projectId: string,
    data: {
      title: string
      description?: string
      assigneeId?: string
      priority?: string
      dueDate?: string
    }
  ) =>
    api
      .post<{ success: true; data: Task }>(`/projects/${projectId}/tasks`, data)
      .then((r) => r.data.data),
  update: (
    projectId: string,
    taskId: string,
    data: {
      title?: string
      description?: string
      assigneeId?: string | null
      priority?: string
      dueDate?: string | null
    }
  ) =>
    api
      .patch<{
        success: true
        data: Task
      }>(`/projects/${projectId}/tasks/${taskId}`, data)
      .then((r) => r.data.data),
  updateStatus: (projectId: string, taskId: string, status: string) =>
    api
      .patch<{
        success: true
        data: Task
      }>(`/projects/${projectId}/tasks/${taskId}/status`, { status })
      .then((r) => r.data.data),
  remove: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
}

// --- Users ---
export const usersApi = {
  list: () =>
    api.get<{ success: true; data: User[] }>('/users').then((r) => r.data.data),
  get: (id: string) =>
    api
      .get<{ success: true; data: User }>(`/users/${id}`)
      .then((r) => r.data.data),
  developers: () =>
    api
      .get<{ success: true; data: User[] }>('/users/developers')
      .then((r) => r.data.data),
  update: (
    id: string,
    data: { name?: string; role?: string; isActive?: boolean }
  ) =>
    api
      .patch<{ success: true; data: User }>(`/users/${id}`, data)
      .then((r) => r.data.data),
}

// --- Notifications ---
export const notificationsApi = {
  list: () =>
    api
      .get<{ success: true; data: Notification[] }>('/notifications')
      .then((r) => r.data.data),
  unreadCount: () =>
    api
      .get<{
        success: true
        data: { count: number }
      }>('/notifications/unread-count')
      .then((r) => r.data.data.count),
  markOne: (id: string) => api.patch(`/notifications/${id}/read`),
  markAll: () => api.patch('/notifications/read-all'),
}

// --- Dashboard ---
export const dashboardApi = {
  get: () =>
    api
      .get<{
        success: true
        data: AdminDashboard | PmDashboard | DeveloperDashboard
      }>('/dashboard')
      .then((r) => r.data.data),
}

// --- Activity ---
export const activityApi = {
  feed: (projectId?: string) =>
    api
      .get<{
        success: true
        data: any[]
      }>('/activity/feed', { params: projectId ? { projectId } : {} })
      .then((r) => r.data.data),
}
