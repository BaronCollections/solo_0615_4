<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
import type { MockUser } from '../../types/auth'
import { getRoleTagType } from '../../constants/roleConfig'

interface Props {
  user: MockUser
  loginTime: Date | null
  rememberMe: boolean
}

interface Emits {
  (e: 'logout'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatLoginTime = (date: Date | null) => {
  if (!date) return '—'
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
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

    <div class="security-tip-card">
      <div class="security-tip-header">
        <el-icon class="security-icon"><Warning /></el-icon>
        <span class="security-title">登录安全提示</span>
      </div>
      <div class="security-tip-body">
        <div class="security-item">
          <span class="security-label">本次登录角色</span>
          <el-tag :type="getRoleTagType(user.role)" size="small">
            {{ user.roleLabel }}
          </el-tag>
        </div>
        <div class="security-item">
          <span class="security-label">当前登录时间</span>
          <span class="security-value">{{ formatLoginTime(loginTime) }}</span>
        </div>
        <div class="security-item">
          <span class="security-label">记住账号状态</span>
          <span class="security-value">
            <el-tag :type="rememberMe ? 'success' : 'info'" size="small">
              {{ rememberMe ? '已开启' : '未开启' }}
            </el-tag>
          </span>
        </div>
      </div>
    </div>
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

.security-tip-card {
  margin-top: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
  border: 1px solid #ffd591;
  border-radius: 8px;
}

.security-tip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.security-icon {
  color: #fa8c16;
  font-size: 18px;
}

.security-title {
  font-size: 15px;
  font-weight: 600;
  color: #d46b08;
}

.security-tip-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.security-label {
  color: #8c6d1f;
  font-weight: 500;
}

.security-value {
  color: #5c4813;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
}
</style>
