import { reactive, computed } from 'vue'
import { mockRecords, nextId, staffList, deptList } from '@/data/mockData.js'

// ── 角色配置 ──────────────────────────────────────────────
export const roleConfig = {
  '普通员工': {
    label: '普通员工',
    user: { name: '鲍淑婷', dept: '战略发展部', isHead: false, isStrategyStaff: false },
    navs: ['register', 'my-records'],
  },
  '部门正职': {
    label: '部门正职',
    user: { name: '余蕊桢', dept: '战略发展部', isHead: true, isStrategyStaff: true },
    navs: ['register', 'my-records', 'pending-approval', 'query-stats'],
  },
  '战略发展部专员': {
    label: '战略发展部专员',
    user: { name: '许越', dept: '战略发展部', isHead: false, isStrategyStaff: true },
    navs: ['register', 'my-records', 'query-stats'],
  },
}

// ── 全局状态 ──────────────────────────────────────────────
const state = reactive({
  currentRole: '部门正职',
  records: mockRecords.map(r => ({ ...r, targets: r.targets.map(t => ({ ...t })), otherStaff: r.otherStaff.map(s => ({ ...s })), ourStaff: [...r.ourStaff] })),
})

export function useStore() {
  // 当前用户信息
  const currentUser = computed(() => roleConfig[state.currentRole].user)

  // 当前角色可访问的导航
  const allowedNavs = computed(() => roleConfig[state.currentRole].navs)

  // 我的记录（当前用户提交的）
  const myRecords = computed(() =>
    state.records.filter(r => r.reporter === currentUser.value.name)
  )

  // 待我审批（当前用户是部门正职，显示本部门待审批记录）
  const pendingRecords = computed(() => {
    if (!currentUser.value.isHead) return []
    return state.records.filter(r => {
      if (r.status !== 'pending') return false
      // 找到填报人所在部门的正职
      const dept = deptList.find(d => d.name === r.reporterDept)
      if (!dept) return false
      const approverName = dept.head || (dept.deputy && dept.deputy[0])
      return approverName === currentUser.value.name
    })
  })

  // 我已审批（用于统计展示）
  const approvedByMe = computed(() =>
    state.records.filter(r => r.approver === currentUser.value.name && r.status === 'approved')
  )

  // 切换角色
  function setRole(role) {
    state.currentRole = role
  }

  // 提交新记录
  function submitRecord(formData) {
    const dept = deptList.find(d => d.name === formData.leadDept)
    // 如果填报人就是部门正职，自动审批通过
    const isReporterHead = dept && dept.head === currentUser.value.name
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    const newRecord = {
      ...formData,
      id: nextId(),
      reporter: currentUser.value.name,
      reporterDept: currentUser.value.dept,
      status: isReporterHead ? 'approved' : 'pending',
      submitTime: timeStr,
      approveTime: isReporterHead ? timeStr : '',
      approver: isReporterHead ? currentUser.value.name : '',
      approverDept: isReporterHead ? currentUser.value.dept : '',
      rejectReason: '',
      _autoApproved: isReporterHead,
    }
    state.records.unshift(newRecord)
    return newRecord
  }

  // 审批通过（ccList 为手动额外抄送人员，自动抄送战略发展部正职余蕊桢）
  function approveRecord(id, ccList = []) {
    const rec = state.records.find(r => r.id === id)
    if (!rec) return
    const now = new Date()
    rec.status = 'approved'
    rec.approver = currentUser.value.name
    rec.approverDept = currentUser.value.dept
    rec.approveTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    rec.rejectReason = ''
    // 合并自动抄送（余蕊桢）与手动选择的人员，去重
    const autoCc = ['余蕊桢']
    rec.ccList = [...new Set([...autoCc, ...ccList])]
  }

  // 退回
  function rejectRecord(id, reason) {
    const rec = state.records.find(r => r.id === id)
    if (!rec) return
    rec.status = 'rejected'
    rec.approver = currentUser.value.name
    rec.approverDept = currentUser.value.dept
    rec.rejectReason = reason
  }

  // 重新提交（退回 → 待审批）
  function resubmitRecord(id, formData) {
    const rec = state.records.find(r => r.id === id)
    if (!rec) return
    Object.assign(rec, formData)
    const now = new Date()
    rec.status = 'pending'
    rec.rejectReason = ''
    rec.submitTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  }

  return {
    state,
    currentUser,
    allowedNavs,
    myRecords,
    pendingRecords,
    approvedByMe,
    setRole,
    submitRecord,
    approveRecord,
    rejectRecord,
    resubmitRecord,
    deptList,
    staffList,
  }
}
