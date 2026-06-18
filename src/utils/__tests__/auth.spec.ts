import { describe, it, expect } from 'vitest'
import { validateLogin } from '../auth'

describe('validateLogin', () => {
  it('succeeds with correct credentials', () => {
    const result = validateLogin('admin', 'admin123')
    expect(result.success).toBe(true)
    expect(result.user?.username).toBe('admin')
  })

  it('fails with wrong password', () => {
    const result = validateLogin('admin', 'wrong')
    expect(result.success).toBe(false)
    expect(result.message).toBe('密码错误')
  })

  it('fails with non-existent username', () => {
    const result = validateLogin('nobody', 'admin123')
    expect(result.success).toBe(false)
    expect(result.message).toBe('账号不存在')
  })

  it('fails when both username and password are empty', () => {
    const result = validateLogin('', '')
    expect(result.success).toBe(false)
    expect(result.message).toBe('请输入账号和密码')
  })

  describe('username trim handling', () => {
    it('trims leading and trailing spaces from username', () => {
      const result = validateLogin('  admin  ', 'admin123')
      expect(result.success).toBe(true)
      expect(result.user?.username).toBe('admin')
    })

    it('trims only leading spaces from username', () => {
      const result = validateLogin('  admin', 'admin123')
      expect(result.success).toBe(true)
      expect(result.user?.username).toBe('admin')
    })

    it('trims only trailing spaces from username', () => {
      const result = validateLogin('admin  ', 'admin123')
      expect(result.success).toBe(true)
      expect(result.user?.username).toBe('admin')
    })

    it('treats spaces-only username as empty', () => {
      const result = validateLogin('   ', 'admin123')
      expect(result.success).toBe(false)
      expect(result.message).toBe('请输入账号和密码')
    })

    it('returns 账号不存在 for spaces-padded unknown username', () => {
      const result = validateLogin('  unknown  ', 'admin123')
      expect(result.success).toBe(false)
      expect(result.message).toBe('账号不存在')
    })
  })

  describe('password no-trim handling', () => {
    it('does not trim spaces from password', () => {
      const result = validateLogin('admin', '  admin123  ')
      expect(result.success).toBe(false)
      expect(result.message).toBe('密码错误')
    })

    it('rejects space-padded password even if core matches', () => {
      const result = validateLogin('admin', ' admin123')
      expect(result.success).toBe(false)
      expect(result.message).toBe('密码错误')
    })

    it('treats spaces-only password as wrong password', () => {
      const result = validateLogin('admin', '   ')
      expect(result.success).toBe(false)
      expect(result.message).toBe('密码错误')
    })
  })
})
