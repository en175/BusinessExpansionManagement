# CLAUDE.md — 广仲业务拓展管理系统 项目简报

> 新对话读完本文件即可无缝接手，无需重新解释背景。

---

## 一、项目背景

**甲方**：广州仲裁委员会（广仲）战略发展部
**需求来源**：信息化建设需求征求意见表单（2026-03-27）
**项目定位**：这是一个 **demo 原型**，用于向甲方演示功能，最终会由开发团队嵌入甲方现有的"仲裁办案管理系统"中。

**业务目标**：在案件管理系统中新增「业务拓展管理」专项模块，供全委 196 名干部职工登记业务拓展活动信息（走访、来访、研讨会等），支持审批、查询和统计导出。

**交付要求**：部署在 Netlify，通过 GitHub 自动构建，供甲方预览。

---

## 二、技术栈与部署

| 项目 | 内容 |
|------|------|
| 前端框架 | Vue 3 + Vite 5 + Composition API (`<script setup>`) |
| UI 组件库 | Element Plus 2.7（中文语言包已配置） |
| 路由 | Vue Router 4，History 模式 |
| 状态管理 | 无 Pinia/Vuex，使用 `reactive` + `provide/inject` 风格的 `useStore.js` |
| 样式 | 纯 CSS 变量（`theme.css`），不用 Tailwind/Bootstrap |
| GitHub | https://github.com/en175/BusinessExpansionManagement |
| Netlify | 自动部署，`main` 分支推送即触发，build 命令 `npm run build`，publish `dist` |
| 本地开发 | `npm run dev`（端口 3000） |

---

## 三、项目文件结构

```
/
├── CLAUDE.md              ← 本文件
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
└── src/
    ├── main.js            ← 注册 EP 组件、中文包、路由
    ├── App.vue            ← 直接渲染 MainLayout
    ├── assets/
    │   └── gac-logo.png   ← 广仲圆形 logo，用于左上角
    ├── styles/
    │   ├── theme.css      ← 所有 CSS 变量（主色、间距、圆角、阴影）
    │   └── base.css       ← 全局重置 + 公共类（.card、.tag-*、.btn-*）
    ├── router/
    │   └── index.js       ← 4 条路由
    ├── data/
    │   └── mockData.js    ← 部门、人员、行业、省市、mock活动记录
    ├── stores/
    │   └── useStore.js    ← 全局状态 + actions（提交/审批/退回/撤回）
    ├── layouts/
    │   └── MainLayout.vue ← 顶部 Header + 左侧折叠导航
    └── views/
        ├── ActivityForm/index.vue   ← 活动登记表单
        ├── MyRecords/index.vue      ← 我的记录（列表+详情抽屉）
        ├── PendingApproval/index.vue← 待我审批（审批+退回）
        └── QueryStats/index.vue     ← 查询与统计（筛选+表格+导出CSV）
```

---

## 四、核心设计决策（已定稿，勿改动）

### 4.1 角色与权限

| 角色 | Demo 用户 | 可访问页面 |
|------|-----------|-----------|
| 普通员工 | 鲍淑婷（战略发展部） | 登记活动、我的记录 |
| 部门正职 | 余莨桢（战略发展部正职） | 登记活动、我的记录、待我审批、查询统计 |
| 战略发展部专员 | 许越（战略发展部） | 登记活动、我的记录、查询统计 |

角色切换通过右上角下拉实现，切换后菜单实时更新，若当前页不可访问则自动跳转首个可用页。

### 4.2 审批流

```
员工填报
  └─→ 推送至【填报人所在部门正职】审批
        ├─ 特殊情况：填报人本身是正职 → 自动通过，系统备注「填报人为部门正职，自动通过」
        └─ 特殊情况：部门无正职（如案件管理三部）→ 推送至副职
  └─→ 审批通过后自动抄送战略发展部正职（余莨桢）+ 指定人员
  └─→ 退回 → 填报人收到通知，可修改后重新提交
  └─→ 待审批记录 → 填报人可撤回，变为草稿状态
```

记录状态：`pending`（待审批）/ `approved`（已通过）/ `rejected`（已退回）/ `draft`（草稿）

### 4.3 开拓对象数据结构

单条活动记录可包含**多个开拓对象**（一对多），每个对象字段：
- `name`（机构名称）、`taxId`（纳税人识别号，预留后续与案件关联）
- `industry`（所属行业，12个选项）、`province` + `city`（省市级联）

### 4.4 查询与统计合并一页

查询和统计在同一页面，上方筛选区 + 下方结果表格 + 导出按钮。导出为 CSV 文件（带 BOM，Excel 可直接打开）。

### 4.5 UI 风格

复用广仲案管系统现有视觉语言，主要规范：

| 变量 | 值 |
|------|----|
| `--primary` | `#3b66f5` |
| `--primary-gradient` | `linear-gradient(135deg, #3b66f5, #6187fa)` |
| `--success` | `#00b479` |
| `--warning` | `#ff9900` |
| `--danger` | `#f53f3f` |
| `--bg-page` | `#f0f3fa` |
| 卡片风格 | 白色背景 + `backdrop-filter: blur(16px)` + 蓝色阴影 |
| 圆角 | `--radius-md: 10px`，`--radius-lg: 14px` |

Element Plus 全局覆盖在 `base.css` 底部。按钮用自定义类（`.btn-primary`、`.btn-default`、`.btn-text`、`.btn-danger-text`），不直接用 EP 的 `el-button` 样式。

---

## 五、人员与部门数据

**部门**：16个（`mockData.js` → `deptList`）
**人员**：约 50 人（`mockData.js` → `staffList`），字段：`id / name / dept / role(head|deputy|staff) / title`
**重点人员**：
- 余莨桢：战略发展部正职（demo 的「部门正职」角色）
- 鲍淑婷：战略发展部普通员工（demo 的「普通员工」角色）
- 许越：战略发展部员工（demo 的「战略发展部专员」角色）

---

## 六、Mock 数据说明

`mockData.js` 中预置 **7 条活动记录**（id 1-7），覆盖各种状态：

| id | 标题 | 填报人 | 状态 | 说明 |
|----|------|--------|------|------|
| 1 | 走访广发证券法务部 | 鲍淑婷 | approved | 普通员工→正职审批 |
| 2 | 国际航运数字化发展研讨会 | 鲍淑婷 | pending | 待余莨桢审批 |
| 3 | 前海合作区法律服务合作洽谈 | 许越 | rejected | 有退回原因示例 |
| 4 | 走访华润集团法务部 | 颜洁（案管一部） | approved | 跨部门示例 |
| 5 | 低空经济法律服务宣讲会 | 何棋嘉 | pending | 待余莨桢审批 |
| 6 | 粤港澳大湾区仲裁合作机制调研 | 余莨桢 | approved | 正职自动审批示例 |
| 7 | 走访广州互联网法院 | 余莨桢 | approved | 正职自动审批示例 |

---

## 七、待办事项（下次对话继续）

### 优先级高（已确认需求）

- [ ] **一、导航栏**：「活动登记」改名为「业务拓展活动登记」
- [ ] **一、登记表单**：
  - 配合部门改为**多选**（v-model 由 string 改为 array，mockData 同步更新）
  - 删除「出席领导」字段（及相关 computed `leaderStaff`、mockData 中的 `ourLeaders`）
  - 后续跟进事项 placeholder 删去「及跟进责任人」
  - 「佐证材料」→「相关材料」（表单 label + section 标题 + 详情抽屉同步）
- [ ] **二、查询与统计**：
  - 筛选区增加「我委参与人员」单选（filterable，数据来自 staffList）
  - 筛选区增加「配合部门」单选（数据来自 deptList）
  - filteredRecords computed 同步增加这两个条件

### 待讨论后再做

- [ ] **三、待我审批**：增加「手动抄送人员」入口（触发时机、范围、效果待确认）
  - **讨论问题**：
    1. 抄送在审批时弹出选择，还是记录上预设？
    2. 范围：仅本部门，还是可跨部门？
    3. 抄送人是否有专属视图，还是仅通知？
    4. 与现有自动抄送战略发展部的关系？

### 其他优化（日后迭代）

- [ ] 「我的记录」页「修改重提」功能：目前跳转登记页但未预填数据，需实现编辑态回填
- [ ] README.md 补充（已有基础版本，可完善）
- [ ] CLAUDE.md 本文件随需求迭代同步更新

---

## 八、注意事项

1. **不要引入新依赖**（如 Pinia、axios、dayjs），现有方案够用
2. **mockData.js 是唯一数据源**，修改字段结构时必须同步更新所有引用处（views + useStore）
3. **配合部门字段**目前在 mockData 里是 string，待办事项改多选时需统一改为 array，注意 QueryStats 里 `supportDept` 的过滤逻辑也要对应修改
4. **不要动 netlify.toml 和 vite.config.js**，当前配置已验证正常
5. 每次改完都要跑 `npm run build` 确认无报错再 push
