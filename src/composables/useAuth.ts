import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { validateLogin } from '../utils/auth'
import type { MockUser } from '../types/auth'

const REMEMBERED_USERNAME_KEY = 'smart_campus_remembered_username'

export function useAuth() {
  const user = ref<MockUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const rememberMe = ref(false)
  const rememberedUsername = ref('')
  const loginTime = ref<Date | null>(null)

  const loadRememberedUsername = () => {
    try {
      const saved = localStorage.getItem(REMEMBERED_USERNAME_KEY)
      if (!saved || saved.trim() === '') {
        return
      }

      let username: string
      if (saved.startsWith('{') || saved.startsWith('[')) {
        const parsed = JSON.parse(saved)
        if (typeof parsed === 'string') {
          username = parsed
        } else if (parsed && typeof parsed === 'object' && 'username' in parsed && typeof (parsed as any).username === 'string') {
          username = (parsed as any).username
        } else {
          return
        }
      } else {
        username = saved
      }

      if (username.trim() !== '') {
        rememberedUsername.value = username
        rememberMe.value = true
      }
    } catch {
    }
  }

  const handleRememberMeChange = (val: boolean) => {
    if (!val) {
      localStorage.removeItem(REMEMBERED_USERNAME_KEY)
      rememberedUsername.value = ''
    }
    rememberMe.value = val
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    return new Promise((resolve) => {
      setTimeout(() => {
        const result = validateLogin(username, password)
        
        if (result.success && result.user) {
          if (rememberMe.value) {
            localStorage.setItem(REMEMBERED_USERNAME_KEY, username)
            rememberedUsername.value = username
          } else {
            localStorage.removeItem(REMEMBERED_USERNAME_KEY)
            rememberedUsername.value = ''
          }
          user.value = result.user
          loginTime.value = new Date()
          ElMessage.success(result.message)
          resolve(true)
        } else {
          error.value = result.message
          ElMessage.error(result.message)
          resolve(false)
        }
        
        loading.value = false
      }, 500)
    })
  }

  const logout = () => {
    user.value = null
    error.value = null
    loginTime.value = null
  }

  const clearError = () => {
    error.value = null
  }

  onMounted(() => {
    loadRememberedUsername()
  })

  return {
    user,
    loading,
    error,
    rememberMe,
    rememberedUsername,
    loginTime,
    login,
    logout,
    handleRememberMeChange,
    loadRememberedUsername,
    clearError
  }
}
