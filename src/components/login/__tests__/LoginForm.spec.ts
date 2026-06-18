import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import LoginForm from '../LoginForm.vue'
import type { LoginFormData } from '../../../types/auth'
import { mockUsers } from '../../../mock/accounts'

describe('LoginForm.vue', () => {
  const mountComponent = (props: any = {}) => {
    const defaultProps = {
      loading: false,
      rememberMe: false,
      initialUsername: '',
      ...props
    }
    return mount(LoginForm, {
      global: {
        plugins: [ElementPlus]
      },
      props: defaultProps
    })
  }

  describe('fillForm exposed method', () => {
    it('fills username and password when fillForm is called', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const admin = mockUsers[0]
      vm.fillForm(admin.username, admin.password)
      await nextTick()

      const formData = vm.getFormData()
      expect(formData.username).toBe(admin.username)
      expect(formData.password).toBe(admin.password)
    })

    it('after fillForm validation passes and fields are populated', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.fillForm('admin', 'admin123')
      await nextTick()

      const formData = vm.getFormData()
      expect(formData.username).toBe('admin')
      expect(formData.password).toBe('admin123')

      let validationResult: boolean | undefined
      await vm.validate((valid: boolean) => {
        validationResult = valid
      })
      await nextTick()

      expect(validationResult).toBe(true)
    })

    it('does not emit submit after fillForm', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.fillForm('teacher', 'teacher123')
      await nextTick()

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('updates both input fields after fillForm', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const student = mockUsers[2]
      vm.fillForm(student.username, student.password)
      await nextTick()

      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
      expect((inputs[0].element as HTMLInputElement).value).toBe(student.username)
      expect((inputs[1].element as HTMLInputElement).value).toBe(student.password)
    })

    it('can be called multiple times and overwrites previous values', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.fillForm(mockUsers[0].username, mockUsers[0].password)
      await nextTick()
      expect(vm.getFormData().username).toBe('admin')

      vm.fillForm(mockUsers[1].username, mockUsers[1].password)
      await nextTick()
      const formData = vm.getFormData()
      expect(formData.username).toBe('teacher')
      expect(formData.password).toBe('teacher123')
    })

    it('after fillForm validation passes without clearing fields again', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.fillForm('admin', 'admin123')
      await nextTick()

      let validationResult: boolean | undefined
      await vm.validate((valid: boolean) => {
        validationResult = valid
      })
      await nextTick()

      expect(validationResult).toBe(true)
      const formData = vm.getFormData()
      expect(formData.username).toBe('admin')
      expect(formData.password).toBe('admin123')
    })
  })

  describe('remember me logic preserved', () => {
    it('emits update:rememberMe and rememberMeChange when checkbox input changes', async () => {
      const wrapper = mountComponent({ rememberMe: false })

      const checkboxRealInput = wrapper.find('.el-checkbox input[type="checkbox"]')
      const el = checkboxRealInput.element as HTMLInputElement
      el.checked = true
      await checkboxRealInput.trigger('change')
      await nextTick()

      const updateEvents = wrapper.emitted('update:rememberMe') as any[]
      expect(updateEvents).toBeTruthy()
      expect(updateEvents[updateEvents.length - 1][0]).toBe(true)

      const changeEvents = wrapper.emitted('rememberMeChange') as any[]
      expect(changeEvents).toBeTruthy()
      expect(changeEvents[changeEvents.length - 1][0]).toBe(true)
    })
  })

  describe('submit and enter key preserved', () => {
    it('emits submit with trimmed username when login button is clicked', async () => {
      const wrapper = mountComponent({ initialUsername: '  admin  ' })
      const vm = wrapper.vm as any

      vm.getFormData().password = 'admin123'
      await nextTick()

      const button = wrapper.find('.login-btn')
      await button.trigger('click')
      await nextTick()

      const submitEvents = wrapper.emitted('submit') as [LoginFormData][] | undefined
      expect(submitEvents).toBeTruthy()
      expect(submitEvents![0][0].username).toBe('admin')
      expect(submitEvents![0][0].password).toBe('admin123')
    })

    it('emits submit when enter is pressed in password field', async () => {
      const wrapper = mountComponent({ initialUsername: 'student' })
      const vm = wrapper.vm as any

      vm.getFormData().password = 'student123'
      await nextTick()

      const passwordInput = wrapper.findAll('input')[1]
      await passwordInput.trigger('keyup.enter')
      await nextTick()

      const submitEvents = wrapper.emitted('submit') as [LoginFormData][] | undefined
      expect(submitEvents).toBeTruthy()
      expect(submitEvents![0][0].username).toBe('student')
      expect(submitEvents![0][0].password).toBe('student123')
    })
  })

  describe('initialUsername watch preserved', () => {
    it('updates form username when initialUsername prop changes', async () => {
      const wrapper = mountComponent({ initialUsername: '' })
      const vm = wrapper.vm as any

      expect(vm.getFormData().username).toBe('')

      await wrapper.setProps({ initialUsername: 'newuser' })
      await nextTick()

      expect(vm.getFormData().username).toBe('newuser')
    })
  })

  describe('resetPassword preserved', () => {
    it('resets only password and keeps username', async () => {
      const wrapper = mountComponent({ initialUsername: 'admin' })
      const vm = wrapper.vm as any

      vm.getFormData().password = 'secret123'
      await nextTick()

      vm.resetPassword()
      await nextTick()

      const formData = vm.getFormData()
      expect(formData.username).toBe('admin')
      expect(formData.password).toBe('')
    })
  })
})
