import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const SKIP_REFRESH = [
  '/auth/refresh',
  '/auth/me',
  '/auth/signin',
  '/auth/signup',
]

let isRefreshing = false
let queue: Array<(ok: boolean) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    const shouldSkip = SKIP_REFRESH.some((path) =>
      original?.url?.includes(path)
    )

    if (error.response?.status !== 401 || original?._retry || shouldSkip) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((ok) => (ok ? resolve(api(original)) : reject(error)))
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      await api.post('/auth/refresh')
      queue.forEach((cb) => cb(true))
      queue = []
      return api(original)
    } catch {
      queue.forEach((cb) => cb(false))
      queue = []
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
