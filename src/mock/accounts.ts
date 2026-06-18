import type { MockUser } from '../types/auth'
import { getRoleLabel } from '../constants/roleConfig'

const createMockUser = (
  username: string,
  password: string,
  name: string,
  role: MockUser['role']
): MockUser => ({
  username,
  password,
  name,
  role,
  roleLabel: getRoleLabel(role)
})

export const mockUsers: MockUser[] = [
  createMockUser('admin', 'admin123', '系统管理员', 'admin'),
  createMockUser('teacher', 'teacher123', '李老师', 'teacher'),
  createMockUser('student', 'student123', '张同学', 'student')
]
