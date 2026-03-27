<template>
  <div class="app-shell">
    <!-- ── Header ── -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo-wrap">
          <img src="@/assets/gac-logo.png" alt="广仲" class="logo-img" />
          <div class="logo-text">
            <span class="logo-main">广州仲裁委员会</span>
            <span class="logo-sub">业务拓展管理系统</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <el-icon class="user-icon"><UserFilled /></el-icon>
          <span class="user-name">{{ currentUser.name }}</span>
          <span class="user-dept">{{ currentUser.dept }}</span>
        </div>
        <div class="divider-v"></div>
        <el-select
          v-model="currentRole"
          size="small"
          style="width: 148px"
          @change="handleRoleChange"
        >
          <template #prefix><el-icon><Switch /></el-icon></template>
          <el-option
            v-for="(cfg, key) in roleConfig"
            :key="key"
            :label="`${cfg.label}（${cfg.user.name}）`"
            :value="key"
          />
        </el-select>
      </div>
    </header>

    <div class="app-body">
      <!-- ── Sidebar ── -->
      <aside class="app-sidebar">
        <div class="sidebar-title">业务拓展管理</div>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in visibleNavItems"
            :key="item.name"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item--active': $route.name === item.name }"
          >
            <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
            <span v-if="item.name === 'pending-approval' && pendingCount > 0" class="nav-badge">
              {{ pendingCount }}
            </span>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <el-icon><InfoFilled /></el-icon>
          <span>Demo 演示版本</span>
        </div>
      </aside>

      <!-- ── Content ── -->
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore, roleConfig } from '@/stores/useStore.js'

const router = useRouter()
const { state, currentUser, allowedNavs, pendingRecords, setRole } = useStore()

const currentRole = computed({
  get: () => state.currentRole,
  set: (v) => setRole(v),
})

const pendingCount = computed(() => pendingRecords.value.length)

const allNavItems = [
  { name: 'register',         path: '/register',         label: '登记活动',   icon: 'EditPen' },
  { name: 'my-records',       path: '/my-records',       label: '我的记录',   icon: 'Document' },
  { name: 'pending-approval', path: '/pending-approval', label: '待我审批',   icon: 'Bell' },
  { name: 'query-stats',      path: '/query-stats',      label: '查询与统计', icon: 'Search' },
]

const visibleNavItems = computed(() =>
  allNavItems.filter(item => allowedNavs.value.includes(item.name))
)

function handleRoleChange(role) {
  setRole(role)
  // Redirect if current page is not allowed
  const allowed = roleConfig[role].navs
  const currentName = router.currentRoute.value.name
  if (!allowed.includes(currentName)) {
    router.push('/' + allowed[0])
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Header */
.app-header {
  height: var(--header-h);
  background: var(--bg-card-solid);
  border-bottom: 1px solid var(--line-solid);
  box-shadow: 0 2px 8px rgba(59,102,245,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--gap-24);
  flex-shrink: 0;
  z-index: 100;
}

.header-left { display: flex; align-items: center; }

.logo-wrap {
  display: flex;
  align-items: center;
  gap: var(--gap-12);
}
.logo-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59,102,245,0.18);
}
.logo-text { display: flex; flex-direction: column; line-height: 1.2; }
.logo-main { font-size: 15px; font-weight: 700; color: var(--text-main); }
.logo-sub  { font-size: 11px; color: var(--text-sub); }

.header-right {
  display: flex;
  align-items: center;
  gap: var(--gap-16);
}
.user-info {
  display: flex;
  align-items: center;
  gap: var(--gap-8);
}
.user-icon { color: var(--primary); font-size: 18px; }
.user-name { font-size: 14px; font-weight: 600; color: var(--text-main); }
.user-dept {
  font-size: 12px;
  color: var(--text-sub);
  background: var(--primary-soft);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.divider-v {
  width: 1px;
  height: 20px;
  background: var(--line-solid);
}

/* Body */
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.app-sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--line-solid);
  box-shadow: var(--shadow-sidebar);
  display: flex;
  flex-direction: column;
  padding: var(--gap-20) 0;
  overflow-y: auto;
}
.sidebar-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-sub);
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: 0 var(--gap-20) var(--gap-12);
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 var(--gap-12);
}
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--gap-10);
  padding: 10px var(--gap-12);
  border-radius: var(--radius-md);
  color: var(--text-regular);
  font-size: 14px;
  text-decoration: none;
  transition: background .15s, color .15s;
  position: relative;
}
.nav-item:hover {
  background: var(--primary-soft);
  color: var(--primary);
}
.nav-item--active {
  background: var(--primary-gradient) !important;
  color: #fff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59,102,245,0.25);
}
.nav-item--active .nav-icon { color: #fff; }
.nav-icon { font-size: 16px; color: var(--text-sub); }
.nav-item--active .nav-icon { color: #fff; }
.nav-badge {
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #f53f3f;
  color: #fff;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-item--active .nav-badge { background: rgba(255,255,255,0.3); }

.sidebar-footer {
  margin-top: auto;
  padding: var(--gap-16) var(--gap-20) 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-placeholder);
}

/* Content */
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--gap-24);
}

/* Route transition */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
