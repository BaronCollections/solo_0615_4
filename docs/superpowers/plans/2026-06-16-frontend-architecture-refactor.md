# 智慧校园前端结构重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Login.vue 中的登录表单、登录成功态、测试账号展示、认证状态管理拆分成清晰模块；新增 useAuth composable 管理认证状态；为后续模块预留应用壳组件；保留原有视觉和行为不回退。

**Architecture:** 采用模块化设计，按职责拆分组件。使用 Vue 3 Composition API 的 composable 模式提取认证状态管理逻辑。UI 组件保持纯粹的展示层，业务逻辑下沉到 composable 和 utils 层。AppShell 作为应用外壳，为后续工作台/考勤/公告等模块预留路由出口和布局结构。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Composition API

---

## 重构后文件结构

```
src/
├── types/
│   └── auth.ts              # 认证相关类型定义（从 mock/accounts.ts 提取）
├── composables/
│   └── useAuth.ts           # 认证状态管理 composable
├── components/
│   ├── login/
│   │   ├── LoginForm.vue    # 登录表单组件（纯展示+事件）
│   │   ├── LoginSuccess.vue # 登录成功态组件
│   │   └── TestAccounts.vue # 测试账号展示组件
│   └── layout/
│       └── AppShell.vue     # 应用壳组件（预留扩展）
├── views/
│   └── Login.vue            # 登录页面（容器组件，整合子组件）
├── mock/
│   └── accounts.ts          # 测试账号数据（保持不变）
├── utils/
│   └── auth.ts              # 登录验证工具函数（保持不变）
├── App.vue                  # 根组件（集成 AppShell）
└── main.ts                  # 入口文件（保持不变）
```

## 模块职责说明

| 模块 | 职责 | 依赖 |
|------|------|------|
| `types/auth.ts` | 集中定义 MockUser、UserRole、LoginForm、AuthState 等类型 | 无 |
| `composables/useAuth.ts` | 管理登录、退出、记住账号、loading、错误消息 | `utils/auth.ts`, `types/auth.ts`, `mock/accounts.ts` |
| `components/login/LoginForm.vue` | 登录表单UI、字段验证、事件emit | 无（纯组件） |
| `components/login/LoginSuccess.vue` | 登录成功展示、用户信息展示、退出按钮 | 无（纯组件） |
| `components/login/TestAccounts.vue` | 测试账号列表展示 | `mock/accounts.ts` |
| `components/layout/AppShell.vue` | 应用外壳、侧边栏预留、内容区域、路由出口预留 | 无 |
| `views/Login.vue` | 容器组件，整合 useAuth 和各子组件 | `useAuth`, `LoginForm`, `LoginSuccess`, `TestAccounts` |

---

## 任务分解

### Task 1: 创建认证类型定义文件

**Files:**
- Create: `src/types/auth.ts`

**Goal:** 集中管理认证相关的 TypeScript 类型，从 mock/accounts.ts 中提取公共类型。

**类型定义：**

```typescript
// src/types/auth.ts
export type UserRole = 'admin' | 'teacher' | 'student'

export interface MockUser {
  username: string
  password: string
  name: string
  role: UserRole
  roleLabel: string
}

export interface LoginFormData {
  username: string
  password: string
}

export interface AuthState {
  user: MockUser | null
  loading: boolean
  error: string | null
  rememberMe: boolean
}

export interface LoginResult {
  success: boolean
  message: string
  user?: MockUser
}
```

**注意：** 创建后需要更新 `mock/accounts.ts` 和 `utils/auth.ts` 从 `types/auth.ts` 导入类型。

---

### Task 2: 更新 mock/accounts.ts 引用类型

**Files:**
- Modify: `src/mock/accounts.ts`

**修改内容：**

```typescript
// src/mock/accounts.ts
import type { MockUser, UserRole } from '../types/auth'

export const mockUsers: MockUser[] = [
  {
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    role: 'admin',
    roleLabel: '管理员'
  },
  {
    username: 'teacher',
    password: 'teacher123',
    name: '李老师',
    role: 'teacher',
    roleLabel: '教师'
  },
  {
    username: 'student',
    password: 'student123',
    name: '张同学',
    role: 'student',
    roleLabel: '学生'
  }
]
```

---

### Task 3: 更新 utils/auth.ts 引用类型

**Files:**
- Modify: `src/utils/auth.ts`

**修改内容：**

```typescript
// src/utils/auth.ts
import { mockUsers } from '../mock/accounts'
import type { LoginResult } from '../types/auth'

export function validateLogin(username: string, password: string): LoginResult {
  if (!username || !password) {
    return {
      success: false,
      message: '请输入账号和密码'
    }
  }

  const user = mockUsers.find((u) => u.username === username)

  if (!user) {
    return {
      success: false,
      message: '账号不存在'
    }
  }

  if (user.password !== password) {
    return {
      success: false,
      message: '密码错误'
    }
  }

  return {
    success: true,
    message: '登录成功',
    user
  }
}
```

---

### Task 4: 创建 useAuth composable

**Files:**
- Create: `src/composables/useAuth.ts`

**实现内容：**

```typescript
// src/composables/useAuth.ts
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { validateLogin } from '../utils/auth'
import type { MockUser, LoginFormData } from '../types/auth'

const REMEMBERED_USERNAME_KEY = 'smart_campus_remembered_username'

export function useAuth() {
  const user = ref<MockUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const rememberMe = ref(false)

  const loginForm = reactive<LoginFormData>({
    username: '',
    password: ''
  })

  const loadRememberedUsername = () => {
    const rememberedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY)
    if (rememberedUsername) {
      loginForm.username = rememberedUsername
      rememberMe.value = true
    }
  }

  const handleRememberMeChange = (val: boolean) => {
    if (!val) {
      localStorage.removeItem(REMEMBERED_USERNAME_KEY)
    }
    rememberMe.value = val
  }

  const login = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    return new Promise((resolve) => {
      setTimeout(() => {
        const result = validateLogin(loginForm.username, loginForm.password)
        
        if (result.success && result.user) {
          if (rememberMe.value) {
            localStorage.setItem(REMEMBERED_USERNAME_KEY, loginForm.username)
          } else {
            localStorage.removeItem(REMEMBERED_USERNAME_KEY)
          }
          user.value = result.user
          ElMessage.success(result.message)
          resolve(true)
        } else {
          error.value = result.message
          ElMessage.error(result.message)
          resolve(false)
        }
        
        loading.value = false
      }, 500)
    })
  }

  const logout = () => {
    user.value = null
    loginForm.password = ''
    if (!rememberMe.value) {
      loginForm.username = ''
    }
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  onMounted(() => {
    loadRememberedUsername()
  })

  return {
    user,
    loading,
    error,
    rememberMe,
    loginForm,
    login,
    logout,
    handleRememberMeChange,
    loadRememberedUsername,
    clearError
  }
}
```

---

### Task 5: 创建 LoginForm.vue 登录表单组件

**Files:**
- Create: `src/components/login/LoginForm.vue`

**实现内容：**

```vue
<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginFormData } from '../../types/auth'

interface Props {
  modelValue: LoginFormData
  loading: boolean
  rememberMe: boolean
}

interface Emits {
  (e: 'update:modelValue', value: LoginFormData): void
  (e: 'update:rememberMe', value: boolean): void
  (e: 'submit'): void
  (e: 'rememberMeChange', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loginFormRef = defineModel<FormInstance>('formRef')

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleSubmit = () => {
  emit('submit')
}

const handleKeyupEnter = () => {
  emit('submit')
}

const handleRememberMeChange = (val: boolean) => {
  emit('update:rememberMe', val)
  emit('rememberMeChange', val)
}

const updateFormField = (field: keyof LoginFormData, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<template>
  <div class="login-card">
    <h1 class="system-title">智慧校园管理系统</h1>
    <h2 class="system-subtitle">Smart Campus Management System</h2>

    <el-form
      ref="loginFormRef"
      :model="modelValue"
      :rules="loginRules"
      class="login-form"
      size="large"
    >
      <el-form-item prop="username">
        <el-input
          :model-value="modelValue.username"
          @update:model-value="updateFormField('username', $event)"
          placeholder="请输入账号"
          :prefix-icon="User"
          clearable
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          :model-value="modelValue.password"
          @update:model-value="updateFormField('password', $event)"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
          @keyup.enter="handleKeyupEnter"
        />
      </el-form-item>

      <el-form-item>
        <el-checkbox
          :model-value="rememberMe"
          @update:model-value="handleRememberMeChange"
        >
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
```

---

### Task 6: 创建 TestAccounts.vue 测试账号展示组件

**Files:**
- Create: `src/components/login/TestAccounts.vue`

**实现内容：**

```vue
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
  margin-top: -12px;
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
```

---

### Task 7: 创建 LoginSuccess.vue 登录成功态组件

**Files:**
- Create: `src/components/login/LoginSuccess.vue`

**实现内容：**

```vue
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
```

---

### Task 8: 创建 AppShell.vue 应用壳组件

**Files:**
- Create: `src/components/layout/AppShell.vue`

**实现内容：**

```vue
<script setup lang="ts">
import type { MockUser } from '../../types/auth'

interface Props {
  user?: MockUser | null
}

defineProps<Props>()
</script>

<template>
  <div class="app-shell">
    <slot />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  width: 100%;
}
</style>
```

---

### Task 9: 重构 Login.vue 整合各子组件

**Files:**
- Modify: `src/views/Login.vue`

**实现内容：**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { useAuth } from '../composables/useAuth'
import LoginForm from '../components/login/LoginForm.vue'
import LoginSuccess from '../components/login/LoginSuccess.vue'
import TestAccounts from '../components/login/TestAccounts.vue'

const {
  user,
  loading,
  rememberMe,
  loginForm,
  login,
  logout,
  handleRememberMeChange,
  loadRememberedUsername
} = useAuth()

const loginFormRef = defineModel<FormInstance>('loginFormRef')

const handleLoginSubmit = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      await login()
    }
  })
}

const handleLogout = () => {
  logout()
}

onMounted(() => {
  loadRememberedUsername()
})
</script>

<template>
  <div class="login-container">
    <template v-if="!user">
      <LoginForm
        v-model="loginForm"
        v-model:form-ref="loginFormRef"
        v-model:remember-me="rememberMe"
        :loading="loading"
        @submit="handleLoginSubmit"
        @remember-me-change="handleRememberMeChange"
      />
      <TestAccounts />
    </template>

    <LoginSuccess
      v-else
      :user="user"
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
```

**注意：** 需要调整 TestAccounts 的样式，使其与 LoginForm 视觉上看起来是一个卡片。当前设计是两个独立的卡片拼接，需要确保视觉一致性。

---

### Task 10: 更新 App.vue 集成 AppShell

**Files:**
- Modify: `src/App.vue`

**实现内容：**

```vue
<script setup lang="ts">
import AppShell from './components/layout/AppShell.vue'
import Login from './views/Login.vue'
</script>

<template>
  <AppShell>
    <Login />
  </AppShell>
</template>
```

---

### Task 11: 调整 TestAccounts 样式（可选优化）

由于 LoginForm 和 TestAccounts 是两个独立组件，为了保持原有的视觉效果（一个完整的卡片），需要调整样式。

**方案：** 在 Login.vue 中使用包裹层，将两个组件放在一个容器内，或者调整 TestAccounts 的样式使其与 LoginForm 无缝连接。

当前 Task 6 中的 TestAccounts 样式已经做了处理：
- `margin-top: -12px` 消除间距
- `border-top-left-radius: 0; border-top-right-radius: 0` 移除顶部圆角

---

### Task 12: 验证重构结果

**验证步骤：**

1. **类型检查：**
   ```bash
   npm run type-check
   ```
   预期：无类型错误

2. **构建验证：**
   ```bash
   npm run build
   ```
   预期：构建成功

3. **功能验证（手动）：**
   - [ ] 页面加载时，测试账号区域正常显示
   - [ ] 输入正确账号密码，登录成功，显示成功页面
   - [ ] 登录成功后显示正确的用户信息和角色标签
   - [ ] 点击退出登录，返回登录表单
   - [ ] 勾选"记住账号"，登录后刷新页面，账号自动填充
   - [ ] 不勾选"记住账号"，登录后刷新页面，账号为空
   - [ ] 输入错误账号/密码，显示正确的错误提示
   - [ ] 回车提交表单功能正常
   - [ ] loading 状态显示正常

---

## 注意事项

1. **保持测试账号不变：** `mock/accounts.ts` 中的账号信息保持原样，只是类型引用改为从 `types/auth.ts` 导入。

2. **保持登录入口不变：** `Login.vue` 仍然是登录页面的入口，只是内部结构重构。

3. **视觉一致性：** 确保重构后的 UI 与原设计完全一致，包括间距、圆角、阴影、颜色等。

4. **行为一致性：** 所有交互行为（表单验证、记住账号、回车登录、loading 状态等）保持原样。

5. **AppShell 的预留设计：** AppShell 目前只提供最基础的外壳，后续添加工作台/考勤/公告模块时，可以在此基础上扩展侧边栏、顶部导航、路由出口等。

---

## 后续扩展建议

当需要添加工作台、考勤、公告等模块时，可以：

1. 在 `AppShell.vue` 中添加侧边栏和顶部导航
2. 集成 Vue Router，在 AppShell 中添加 `<router-view>`
3. 新增 `views/Dashboard.vue`、`views/Attendance.vue`、`views/Notice.vue` 等页面
4. 在 `useAuth.ts` 中添加路由守卫逻辑
5. 新增各模块对应的 components 和 composables
