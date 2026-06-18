import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useAuth } from '../useAuth'

const mountWithAuth = () => {
  const Comp = defineComponent({
    setup() {
      const auth = useAuth()
      return { auth }
    },
    template: '<div />'
  })
  const wrapper = mount(Comp)
  return { wrapper, auth: (wrapper.vm as any).auth }
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('login sets loginTime on successful login', async () => {
    const { auth } = mountWithAuth()
    const { user, loginTime, login, rememberMe } = auth

    rememberMe.value = false

    const beforeLogin = Date.now()

    const resultPromise = login('admin', 'admin123')
    vi.advanceTimersByTime(600)
    const result = await resultPromise

    const afterLogin = Date.now()

    expect(result).toBe(true)
    expect(user.value).not.toBeNull()
    expect(loginTime.value).toBeInstanceOf(Date)
    expect(loginTime.value!.getTime()).toBeGreaterThanOrEqual(beforeLogin)
    expect(loginTime.value!.getTime()).toBeLessThanOrEqual(afterLogin)
  })

  it('logout clears loginTime and user', async () => {
    const { auth } = mountWithAuth()
    const { user, loginTime, login, logout, rememberMe } = auth

    rememberMe.value = false

    vi.setSystemTime(new Date('2025-06-18T10:00:00'))
    const resultPromise = login('admin', 'admin123')
    vi.advanceTimersByTime(600)
    await resultPromise

    expect(user.value).not.toBeNull()
    expect(loginTime.value).not.toBeNull()

    logout()

    expect(user.value).toBeNull()
    expect(loginTime.value).toBeNull()
  })

  it('re-login after logout refreshes loginTime', async () => {
    const { auth } = mountWithAuth()
    const { user, loginTime, login, logout, rememberMe } = auth

    rememberMe.value = false

    vi.setSystemTime(new Date('2025-06-18T10:00:00'))
    const firstPromise = login('admin', 'admin123')
    vi.advanceTimersByTime(600)
    await firstPromise

    const firstLoginTime = loginTime.value?.getTime()
    expect(firstLoginTime).toBeDefined()

    logout()
    expect(loginTime.value).toBeNull()

    vi.setSystemTime(new Date('2025-06-18T11:30:00'))
    const secondPromise = login('admin', 'admin123')
    vi.advanceTimersByTime(600)
    await secondPromise

    expect(user.value).not.toBeNull()
    expect(loginTime.value).not.toBeNull()
    expect(loginTime.value!.getTime()).toBeGreaterThan(firstLoginTime!)
  })

  it('failed login does not set loginTime', async () => {
    const { auth } = mountWithAuth()
    const { user, loginTime, login, rememberMe } = auth

    rememberMe.value = false

    vi.setSystemTime(new Date('2025-06-18T10:00:00'))

    const resultPromise = login('admin', 'wrongpassword')
    vi.advanceTimersByTime(600)
    const result = await resultPromise

    expect(result).toBe(false)
    expect(user.value).toBeNull()
    expect(loginTime.value).toBeNull()
  })

  describe('remember me trims username', () => {
    it('stores trimmed username when rememberMe is true', async () => {
      const { auth } = mountWithAuth()
      const { login, rememberMe } = auth

      rememberMe.value = true

      const resultPromise = login('  admin  ', 'admin123')
      vi.advanceTimersByTime(600)
      await resultPromise

      const stored = localStorage.getItem('smart_campus_remembered_username')
      expect(stored).toBe('admin')
    })

    it('restores trimmed username from localStorage', async () => {
      localStorage.setItem('smart_campus_remembered_username', '  admin  ')

      const Comp = defineComponent({
        setup() {
          const auth = useAuth()
          return { auth }
        },
        template: '<div />'
      })
      const wrapper = mount(Comp)
      const auth = (wrapper.vm as any).auth

      await vi.advanceTimersByTimeAsync(0)

      expect(auth.rememberedUsername.value).toBe('admin')
      expect(auth.rememberMe.value).toBe(true)
    })
  })
})
