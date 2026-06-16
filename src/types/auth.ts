export type UserRole = 'admin' | 'teacher' | 'student'

export interface MockUser {
  username: string
  password: string
  name: string
  role: UserRole
  roleLabel: string
}

export interface LoginFormData {
  username: string
  password: string
}

export interface AuthState {
  user: MockUser | null
  loading: boolean
  error: string | null
  rememberMe: boolean
}

export interface LoginResult {
  success: boolean
  message: string
  user?: MockUser
}
