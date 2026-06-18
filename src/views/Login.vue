<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import LoginForm from '../components/login/LoginForm.vue'
import LoginSuccess from '../components/login/LoginSuccess.vue'
import TestAccounts from '../components/login/TestAccounts.vue'
import type { LoginFormData, MockUser } from '../types/auth'

const {
  user,
  loading,
  rememberMe,
  rememberedUsername,
  loginTime,
  login,
  logout,
  handleRememberMeChange,
  loadRememberedUsername
} = useAuth()

const loginFormRef = ref<InstanceType<typeof LoginForm>>()

const handleLoginSubmit = async (formData: LoginFormData) => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await login(formData.username, formData.password)
      if (!success && loginFormRef.value) {
        loginFormRef.value.resetPassword()
      }
    }
  })
}

const handleLogout = () => {
  logout()
  if (loginFormRef.value) {
    loginFormRef.value.resetPassword()
    if (!rememberMe.value) {
      loginFormRef.value.getFormData().username = ''
    }
  }
}

const handleSelectAccount = (account: MockUser) => {
  if (!loginFormRef.value) return
  loginFormRef.value.fillForm(account.username, account.password)
}

onMounted(() => {
  loadRememberedUsername()
})
</script>

<template>
  <div class="login-container">
    <template v-if="!user">
      <LoginForm
        ref="loginFormRef"
        :initial-username="rememberedUsername"
        v-model:remember-me="rememberMe"
        :loading="loading"
        @submit="handleLoginSubmit"
        @remember-me-change="handleRememberMeChange"
      />
      <TestAccounts @select-account="handleSelectAccount" />
    </template>

    <LoginSuccess
      v-else
      :user="user"
      :login-time="loginTime"
      :remember-me="rememberMe"
      @logout="handleLogout"
    />
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}
</style>
