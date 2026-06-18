<script setup lang="ts">
import { mockUsers } from '../../mock/accounts'
import type { MockUser } from '../../types/auth'

interface Emits {
  (e: 'select-account', account: MockUser): void
}

const emit = defineEmits<Emits>()

const handleAccountClick = (user: MockUser) => {
  emit('select-account', user)
}
</script>

<template>
  <div class="test-accounts-wrapper">
    <el-divider>测试账号</el-divider>

    <div class="test-accounts">
      <el-alert
        v-for="user in mockUsers"
        :key="user.role"
        :title="`${user.roleLabel}：${user.username} / ${user.password}（${user.name}）`"
        type="info"
        :closable="false"
        show-icon
        class="account-item"
        :class="['clickable', `role-${user.role}`]"
        @click="handleAccountClick(user)"
      />
    </div>
  </div>
</template>

<style scoped>
.test-accounts-wrapper {
  width: 420px;
  padding: 0 40px 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.test-accounts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-item :deep(.el-alert__content) {
  width: 100%;
}

.account-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-item.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #409eff;
}

.account-item.clickable:active {
  transform: translateY(0);
}

.account-item.role-admin:hover :deep(.el-alert__title) {
  color: #409eff;
}

.account-item.role-teacher:hover :deep(.el-alert__title) {
  color: #67c23a;
}

.account-item.role-student:hover :deep(.el-alert__title) {
  color: #e6a23c;
}
</style>
