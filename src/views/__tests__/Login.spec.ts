import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import Login from '../Login.vue'

const mountLogin = () => {
  localStorage.clear()
  return mount(Login, {
    global: {
      plugins: [ElementPlus]
    }
  })
}

describe('Login.vue - 测试账号一键填入回归测试', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const getLoginFormInputs = (wrapper: any) => {
    const inputs = wrapper.findAll('.login-card input')
    return {
      usernameInput: inputs[0],
      passwordInput: inputs[1]
    }
  }

  const getTestAccountAlerts = (wrapper: any) => {
    return wrapper.findAll('.test-accounts .el-alert')
  }

  const getLoginButton = (wrapper: any) => {
    return wrapper.find('.login-btn')
  }

  describe('点击测试账号仅填入账号密码，不触发登录', () => {
    it('点击教师账号：填入 teacher/teacher123，未触发登录', async () => {
      const wrapper = mountLogin()
      const alerts = getTestAccountAlerts(wrapper)

      expect(wrapper.find('.login-card').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)

      await alerts[1].trigger('click')
      await nextTick()
      await vi.advanceTimersByTimeAsync(100)

      const { usernameInput, passwordInput } = getLoginFormInputs(wrapper)
      expect((usernameInput.element as HTMLInputElement).value).toBe('teacher')
      expect((passwordInput.element as HTMLInputElement).value).toBe('teacher123')

      await vi.advanceTimersByTimeAsync(1000)
      await nextTick()

      expect(wrapper.find('.login-card').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)
    })

    it('点击学生账号：填入 student/student123，未触发登录', async () => {
      const wrapper = mountLogin()
      const alerts = getTestAccountAlerts(wrapper)

      expect(wrapper.find('.login-card').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)

      await alerts[2].trigger('click')
      await nextTick()
      await vi.advanceTimersByTimeAsync(100)

      const { usernameInput, passwordInput } = getLoginFormInputs(wrapper)
      expect((usernameInput.element as HTMLInputElement).value).toBe('student')
      expect((passwordInput.element as HTMLInputElement).value).toBe('student123')

      await vi.advanceTimersByTimeAsync(1000)
      await nextTick()

      expect(wrapper.find('.login-card').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)
    })

    it('切换点击多个账号仅填入，不触发登录', async () => {
      const wrapper = mountLogin()
      const alerts = getTestAccountAlerts(wrapper)

      await alerts[1].trigger('click')
      await nextTick()

      let { usernameInput, passwordInput } = getLoginFormInputs(wrapper)
      expect((usernameInput.element as HTMLInputElement).value).toBe('teacher')
      expect((passwordInput.element as HTMLInputElement).value).toBe('teacher123')

      await alerts[2].trigger('click')
      await nextTick()

      const inputsAfter = wrapper.findAll('.login-card input')
      expect((inputsAfter[0].element as HTMLInputElement).value).toBe('student')
      expect((inputsAfter[1].element as HTMLInputElement).value).toBe('student123')

      await vi.advanceTimersByTimeAsync(2000)
      await nextTick()

      expect(wrapper.find('.login-card').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)
    })
  })

  describe('填入后主动触发登录才进入成功态', () => {
    it('教师账号填入后 -> 点击登录按钮 -> 进入登录成功态', async () => {
      const wrapper = mountLogin()
      const alerts = getTestAccountAlerts(wrapper)

      await alerts[1].trigger('click')
      await nextTick()
      await vi.advanceTimersByTimeAsync(50)

      const { usernameInput, passwordInput } = getLoginFormInputs(wrapper)
      expect((usernameInput.element as HTMLInputElement).value).toBe('teacher')
      expect((passwordInput.element as HTMLInputElement).value).toBe('teacher123')
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)

      const loginBtn = getLoginButton(wrapper)
      await loginBtn.trigger('click')
      await nextTick()

      const loginPromise = vi.advanceTimersByTimeAsync(600)
      await loginPromise
      await nextTick()

      expect(wrapper.find('.login-card').exists()).toBe(false)
      const successComp = wrapper.findComponent({ name: 'LoginSuccess' })
      expect(successComp.exists()).toBe(true)
      expect(wrapper.text()).toContain('李老师')
      expect(wrapper.text()).toContain('教师')
    })

    it('学生账号填入后 -> 密码框按回车键 -> 进入登录成功态', async () => {
      const wrapper = mountLogin()
      const alerts = getTestAccountAlerts(wrapper)

      await alerts[2].trigger('click')
      await nextTick()
      await vi.advanceTimersByTimeAsync(50)

      const { usernameInput, passwordInput } = getLoginFormInputs(wrapper)
      expect((usernameInput.element as HTMLInputElement).value).toBe('student')
      expect((passwordInput.element as HTMLInputElement).value).toBe('student123')
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)

      await passwordInput.trigger('keyup.enter')
      await nextTick()

      await vi.advanceTimersByTimeAsync(600)
      await nextTick()

      expect(wrapper.find('.login-card').exists()).toBe(false)
      const successComp = wrapper.findComponent({ name: 'LoginSuccess' })
      expect(successComp.exists()).toBe(true)
      expect(wrapper.text()).toContain('张同学')
      expect(wrapper.text()).toContain('学生')
    })

    it('教师账号填入后 -> 登录失败 -> 密码被清空但账号保留，未进入成功态', async () => {
      const wrapper = mountLogin()
      const alerts = getTestAccountAlerts(wrapper)

      await alerts[1].trigger('click')
      await nextTick()

      const { passwordInput } = getLoginFormInputs(wrapper)
      ;(passwordInput.element as HTMLInputElement).value = 'wrongpass'
      await passwordInput.trigger('input')
      await nextTick()

      const loginBtn = getLoginButton(wrapper)
      await loginBtn.trigger('click')
      await nextTick()

      await vi.advanceTimersByTimeAsync(600)
      await nextTick()

      expect(wrapper.find('.login-card').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'LoginSuccess' }).exists()).toBe(false)

      const inputsAfter = wrapper.findAll('.login-card input')
      expect((inputsAfter[0].element as HTMLInputElement).value).toBe('teacher')
      expect((inputsAfter[1].element as HTMLInputElement).value).toBe('')
    })
  })
})
