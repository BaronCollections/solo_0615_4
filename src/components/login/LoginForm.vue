<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginFormData } from '../../types/auth'

interface Props {
  initialUsername?: string
  loading: boolean
  rememberMe: boolean
}

interface Emits {
  (e: 'update:rememberMe', value: boolean): void
  (e: 'submit', data: LoginFormData): void
  (e: 'rememberMeChange', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loginFormRef = ref<FormInstance>()

const formData = ref<LoginFormData>({
  username: props.initialUsername || '',
  password: ''
})

watch(
  () => props.initialUsername,
  (newVal) => {
    if (newVal !== undefined) {
      formData.value.username = newVal
    }
  }
)

const localRememberMe = computed({
  get: () => props.rememberMe,
  set: (val: boolean) => {
    emit('update:rememberMe', val)
    emit('rememberMeChange', val)
  }
})

defineExpose({
  validate: (callback?: (valid: boolean) => void) => {
    return loginFormRef.value?.validate(callback)
  },
  getFormData: () => formData.value,
  resetPassword: () => {
    formData.value.password = ''
  }
})

const loginRules: FormRules = {
  username: [
    {
      required: true,
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (!value || !value.trim()) {
          callback(new Error('请输入账号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleSubmit = () => {
  emit('submit', { username: formData.value.username.trim(), password: formData.value.password })
}

const handleKeyupEnter = () => {
  emit('submit', { username: formData.value.username.trim(), password: formData.value.password })
}
</script>

<template>
  <div class="login-card">
    <h1 class="system-title">智慧校园管理系统</h1>
    <h2 class="system-subtitle">Smart Campus Management System</h2>

    <el-form
      ref="loginFormRef"
      :model="formData"
      :rules="loginRules"
      class="login-form"
      size="large"
    >
      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入账号"
          :prefix-icon="User"
          clearable
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
          @keyup.enter="handleKeyupEnter"
        />
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="localRememberMe">
          记住账号
        </el-checkbox>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="login-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          登 录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.login-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.system-title {
  text-align: center;
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.system-subtitle {
  text-align: center;
  margin: 0 0 32px;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  letter-spacing: 1px;
}

.login-form {
  margin-bottom: 0;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 8px;
}
</style>
