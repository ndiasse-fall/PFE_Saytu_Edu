import axios from 'axios'
import { getStoredToken } from '../storage/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
})

httpClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response.data,
  (axiosError) => {
    const responseData = axiosError.response?.data
    const error = new Error(
      responseData?.message
        || axiosError.message
        || 'Une erreur est survenue lors de la communication avec le serveur.',
    )

    error.status = axiosError.response?.status
    error.details = responseData?.errors ?? {}
    error.cause = axiosError

    return Promise.reject(error)
  },
)

export function apiClient(path, options = {}) {
  const { body, data, ...config } = options

  return httpClient.request({
    url: path,
    ...config,
    data: data ?? body,
  })
}
