<script setup lang="ts">
import { mockUsers } from '../../mock/accounts'
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
</style>
