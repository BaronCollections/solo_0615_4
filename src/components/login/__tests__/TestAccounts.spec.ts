import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import TestAccounts from '../TestAccounts.vue'
import type { MockUser } from '../../../types/auth'
import { mockUsers } from '../../../mock/accounts'

describe('TestAccounts.vue', () => {
  const mountComponent = () => {
    return mount(TestAccounts, {
      global: {
        plugins: [ElementPlus]
      }
    })
  }

  it('renders all three test accounts', () => {
    const wrapper = mountComponent()
    const alerts = wrapper.findAll('.el-alert')
    expect(alerts.length).toBe(3)
    expect(wrapper.text()).toContain('管理员：admin / admin123（系统管理员）')
    expect(wrapper.text()).toContain('教师：teacher / teacher123（李老师）')
    expect(wrapper.text()).toContain('学生：student / student123（张同学）')
  })

  describe('click handlers', () => {
    it('emits select-account with admin user when admin account is clicked', async () => {
      const wrapper = mountComponent()
      const alerts = wrapper.findAll('.el-alert')

      await alerts[0].trigger('click')

      const emitted = wrapper.emitted('select-account') as [MockUser][] | undefined
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0][0]).toEqual(mockUsers[0])
      expect(emitted![0][0].username).toBe('admin')
      expect(emitted![0][0].password).toBe('admin123')
      expect(emitted![0][0].role).toBe('admin')
    })

    it('emits select-account with teacher user when teacher account is clicked', async () => {
      const wrapper = mountComponent()
      const alerts = wrapper.findAll('.el-alert')

      await alerts[1].trigger('click')

      const emitted = wrapper.emitted('select-account') as [MockUser][] | undefined
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0][0]).toEqual(mockUsers[1])
      expect(emitted![0][0].username).toBe('teacher')
      expect(emitted![0][0].password).toBe('teacher123')
      expect(emitted![0][0].role).toBe('teacher')
    })

    it('emits select-account with student user when student account is clicked', async () => {
      const wrapper = mountComponent()
      const alerts = wrapper.findAll('.el-alert')

      await alerts[2].trigger('click')

      const emitted = wrapper.emitted('select-account') as [MockUser][] | undefined
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0][0]).toEqual(mockUsers[2])
      expect(emitted![0][0].username).toBe('student')
      expect(emitted![0][0].password).toBe('student123')
      expect(emitted![0][0].role).toBe('student')
    })

    it('emits separate events for consecutive clicks on different accounts', async () => {
      const wrapper = mountComponent()
      const alerts = wrapper.findAll('.el-alert')

      await alerts[0].trigger('click')
      await alerts[2].trigger('click')
      await alerts[1].trigger('click')

      const emitted = wrapper.emitted('select-account') as [MockUser][] | undefined
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(3)
      expect(emitted![0][0].role).toBe('admin')
      expect(emitted![1][0].role).toBe('student')
      expect(emitted![2][0].role).toBe('teacher')
    })
  })

  describe('role-based class names', () => {
    it('applies role-admin and clickable class attributes (rendered in html)', () => {
      const wrapper = mountComponent()
      const html = wrapper.html()
      expect(html).toContain('role-admin')
      expect(html).toContain('role-teacher')
      expect(html).toContain('role-student')
      const count = (html.match(/clickable/g) || []).length
      expect(count).toBe(3)
    })
  })
})
