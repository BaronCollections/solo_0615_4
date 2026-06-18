import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import LoginSuccess from '../LoginSuccess.vue'
import type { MockUser } from '../../../types/auth'

const mockAdminUser: MockUser = {
  username: 'admin',
  password: 'admin123',
  name: '系统管理员',
  role: 'admin',
  roleLabel: '管理员'
}

const mockStudentUser: MockUser = {
  username: 'student',
  password: 'student123',
  name: '张同学',
  role: 'student',
  roleLabel: '学生'
}

describe('LoginSuccess.vue', () => {
  const mountComponent = (props: any) => {
    return mount(LoginSuccess, {
      global: {
        plugins: [ElementPlus]
      },
      props
    })
  }

  it('renders security tip card title', () => {
    const wrapper = mountComponent({
      user: mockAdminUser,
      loginTime: new Date('2025-01-15T10:30:45'),
      rememberMe: true
    })
    expect(wrapper.text()).toContain('登录安全提示')
  })

  describe('role display', () => {
    it('shows admin role label', () => {
      const wrapper = mountComponent({
        user: mockAdminUser,
        loginTime: new Date(),
        rememberMe: false
      })
      expect(wrapper.text()).toContain('本次登录角色')
      expect(wrapper.text()).toContain('管理员')
    })

    it('shows student role label', () => {
      const wrapper = mountComponent({
        user: mockStudentUser,
        loginTime: new Date(),
        rememberMe: false
      })
      expect(wrapper.text()).toContain('学生')
    })
  })

  describe('login time display', () => {
    it('shows formatted login time', () => {
      const loginTime = new Date('2025-06-18T14:05:09')
      const wrapper = mountComponent({
        user: mockAdminUser,
        loginTime,
        rememberMe: false
      })
      expect(wrapper.text()).toContain('当前登录时间')
      expect(wrapper.text()).toContain('2025-06-18 14:05:09')
    })

    it('shows dash when loginTime is null', () => {
      const wrapper = mountComponent({
        user: mockAdminUser,
        loginTime: null,
        rememberMe: false
      })
      expect(wrapper.text()).toContain('当前登录时间')
      expect(wrapper.text()).toContain('—')
    })
  })

  describe('remember me status', () => {
    it('shows 已开启 when rememberMe is true', () => {
      const wrapper = mountComponent({
        user: mockAdminUser,
        loginTime: new Date(),
        rememberMe: true
      })
      expect(wrapper.text()).toContain('记住账号状态')
      expect(wrapper.text()).toContain('已开启')
    })

    it('shows 未开启 when rememberMe is false', () => {
      const wrapper = mountComponent({
        user: mockAdminUser,
        loginTime: new Date(),
        rememberMe: false
      })
      expect(wrapper.text()).toContain('记住账号状态')
      expect(wrapper.text()).toContain('未开启')
    })
  })

  it('emits logout when button is clicked', async () => {
    const wrapper = mountComponent({
      user: mockAdminUser,
      loginTime: new Date(),
      rememberMe: true
    })
    const logoutBtn = wrapper.find('button')
    await logoutBtn.trigger('click')
    expect(wrapper.emitted('logout')).toBeTruthy()
  })
})
