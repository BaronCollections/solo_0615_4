<script setup lang="ts">
import type { MockUser } from '../../types/auth'

interface Props {
  user: MockUser
}

interface Emits {
  (e: 'logout'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const getRoleTagType = (role: string) => {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'teacher':
      return 'warning'
    case 'student':
      return 'success'
    default:
      return 'info'
  }
}
</script>

<template>
  <div class="success-card">
    <el-result icon="success" title="登录成功">
      <template #sub-title>
        <div class="user-info">
          <p>
            <span class="label">姓名：</span>
            <span class="value">{{ user.name }}</span>
          </p>
          <p>
            <span class="label">角色：</span>
            <el-tag :type="getRoleTagType(user.role)">
              {{ user.roleLabel }}
            </el-tag>
          </p>
        </div>
      </template>
      <template #extra>
        <el-button type="primary" @click="emit('logout')">退出登录</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.success-card {
  width: 480px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.user-info {
  text-align: left;
  padding: 16px 24px;
  background: #f5f7fa;
  border-radius: 8px;
}

.user-info p {
  margin: 8px 0;
  font-size: 15px;
}

.user-info .label {
  color: #606266;
  font-weight: 500;
}

.user-info .value {
  color: #303133;
  font-weight: 600;
}
</style>
