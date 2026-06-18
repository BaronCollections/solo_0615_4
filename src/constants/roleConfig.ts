import type { UserRole } from '../types/auth'

interface RoleConfig {
  label: string
  tagType: 'danger' | 'warning' | 'success' | 'info'
}

const ROLE_CONFIG_MAP: Record<UserRole, RoleConfig> = {
  admin: {
    label: '管理员',
    tagType: 'danger'
  },
  teacher: {
    label: '教师',
    tagType: 'warning'
  },
  student: {
    label: '学生',
    tagType: 'success'
  }
}

export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIG_MAP[role] ?? {
    label: role,
    tagType: 'info'
  }
}

export function getRoleLabel(role: UserRole): string {
  return getRoleConfig(role).label
}

export function getRoleTagType(role: UserRole): RoleConfig['tagType'] {
  return getRoleConfig(role).tagType
}
