<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h2 class="page-title">查询与统计</h2>
        <p class="page-desc">检索全委业务拓展活动记录，按条件筛选后可导出 Excel 明细表。</p>
      </div>
      <button class="btn-primary" @click="exportExcel">
        <el-icon><Download /></el-icon> 导出 Excel
      </button>
    </div>

    <!-- 汇总统计卡片 -->
    <div class="kpi-row">
      <div class="kpi-card" v-for="k in kpiCards" :key="k.label">
        <div class="kpi-icon" :style="{ background: k.bg }">
          <el-icon :style="{ color: k.color }"><component :is="k.icon" /></el-icon>
        </div>
        <div class="kpi-info">
          <div class="kpi-num">{{ k.value }}</div>
          <div class="kpi-label">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选面板 -->
    <div class="search-panel card">
      <div class="search-panel-title">
        <el-icon><Filter /></el-icon> 筛选条件
        <button class="btn-text reset-btn" @click="resetFilters" style="margin-left:auto">
          <el-icon><RefreshLeft /></el-icon> 重置
        </button>
      </div>
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="filter-label">开拓对象名称</div>
          <el-input
            v-model="filters.targetName"
            placeholder="输入机构名称关键词"
            clearable
            :prefix-icon="Search"
          />
        </el-col>
        <el-col :span="6">
          <div class="filter-label">活动时间范围</div>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-col>
        <el-col :span="4">
          <div class="filter-label">活动形式</div>
          <el-select v-model="filters.activityType" placeholder="全部" clearable style="width:100%">
            <el-option v-for="t in activityTypeList" :key="t" :label="t" :value="t" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <div class="filter-label">所属行业</div>
          <el-select v-model="filters.industry" placeholder="全部" clearable style="width:100%">
            <el-option v-for="ind in industryList" :key="ind" :label="ind" :value="ind" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <div class="filter-label">牵头部门</div>
          <el-select v-model="filters.dept" placeholder="全部" clearable style="width:100%">
            <el-option v-for="d in deptList" :key="d.id" :label="d.name" :value="d.name" />
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top:12px">
        <el-col :span="6">
          <div class="filter-label">填报人</div>
          <el-select
            v-model="filters.reporter"
            filterable
            clearable
            placeholder="输入姓名搜索"
            style="width:100%"
          >
            <el-option v-for="s in staffList" :key="s.id" :label="`${s.name}（${s.dept}）`" :value="s.name" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <div class="filter-label">审批状态</div>
          <el-select v-model="filters.status" placeholder="全部" clearable style="width:100%">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已退回" value="rejected" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <div class="filter-label">我委参与人员</div>
          <el-select
            v-model="filters.staffMember"
            filterable
            clearable
            placeholder="输入姓名搜索"
            style="width:100%"
          >
            <el-option v-for="s in staffList" :key="s.id" :label="`${s.name}（${s.dept}）`" :value="s.name" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <div class="filter-label">配合部门</div>
          <el-select v-model="filters.supportDept" placeholder="全部" clearable style="width:100%">
            <el-option v-for="d in deptList" :key="d.id" :label="d.name" :value="d.name" />
          </el-select>
        </el-col>
        <el-col :span="4" style="display:flex;align-items:flex-end">
          <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
            <span style="font-size:13px;color:var(--text-sub)">
              找到 <strong style="color:var(--primary)">{{ filteredRecords.length }}</strong> 条记录
            </span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 结果表格 -->
    <div class="table-wrap card">
      <el-table
        :data="filteredRecords"
        style="width:100%"
        :empty-text="'暂无符合条件的记录'"
        row-key="id"
      >
        <el-table-column label="活动标题" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.title" placement="top" :show-after="300">
              <span class="table-title" @click="viewDetail(row)">{{ row.title }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="填报人" prop="reporter" width="90">
          <template #default="{ row }">
            <div>{{ row.reporter }}</div>
            <div style="font-size:11px;color:var(--text-sub)">{{ row.reporterDept }}</div>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="120">
          <template #default="{ row }">
            {{ row.dateStart }}
            <template v-if="row.dateEnd !== row.dateStart"><br/><span style="color:var(--text-sub);font-size:11px">至 {{ row.dateEnd }}</span></template>
          </template>
        </el-table-column>
        <el-table-column label="活动形式" prop="activityType" width="90" />
        <el-table-column label="规模" prop="scale" width="65" align="center">
          <template #default="{ row }">{{ row.scale }}人</template>
        </el-table-column>
        <el-table-column label="开拓对象" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-targets">
              <span v-for="t in row.targets" :key="t.name" class="mini-target">
                {{ t.name }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="行业" width="90" show-overflow-tooltip>
          <template #default="{ row }">
            {{ [...new Set(row.targets.map(t => t.industry))].join('、') }}
          </template>
        </el-table-column>
        <el-table-column label="牵头部门" prop="leadDept" width="110" show-overflow-tooltip />
        <el-table-column label="状态" width="84">
          <template #default="{ row }">
            <span :class="['tag', `tag-${row.status}`]">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="72" fixed="right">
          <template #default="{ row }">
            <button class="btn-text" @click="viewDetail(row)">
              <el-icon><View /></el-icon>
            </button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" :title="detailRecord?.title" size="600px" direction="rtl">
      <template v-if="detailRecord">
        <div class="detail-section">
          <div class="detail-status-bar">
            <span :class="['tag', `tag-${detailRecord.status}`]" style="font-size:14px;padding:4px 14px">
              {{ statusLabel(detailRecord.status) }}
            </span>
            <span style="font-size:12px;color:var(--text-sub)">提交：{{ detailRecord.submitTime }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <dl class="detail-grid">
            <dt>填报人</dt>     <dd>{{ detailRecord.reporter }}（{{ detailRecord.reporterDept }}）</dd>
            <dt>我委对接人</dt> <dd>{{ detailRecord.contact }}</dd>
            <dt>牵头部门</dt>   <dd>{{ detailRecord.leadDept }}</dd>
            <dt>配合部门</dt>   <dd>{{ detailRecord.supportDept?.length ? detailRecord.supportDept.join('、') : '—' }}</dd>
            <dt>活动时间</dt>
            <dd>{{ detailRecord.dateStart }}{{ detailRecord.dateEnd !== detailRecord.dateStart ? ' 至 ' + detailRecord.dateEnd : '' }}</dd>
            <dt>活动形式</dt>   <dd>{{ detailRecord.activityType }}</dd>
            <dt>活动规模</dt>   <dd>{{ detailRecord.scale }} 人</dd>
          </dl>
        </div>
        <div class="detail-section">
          <div class="section-title">参与人员</div>
          <dl class="detail-grid">
            <dt>我委参与</dt> <dd>{{ detailRecord.ourStaff.join('、') }}</dd>
            <dt v-if="detailRecord.ourLeaders?.length">出席领导</dt>
            <dd v-if="detailRecord.ourLeaders?.length">{{ detailRecord.ourLeaders.join('、') }}</dd>
            <dt>对方参与</dt>
            <dd>
              <div v-for="p in detailRecord.otherStaff" :key="p.name" class="other-person-row">
                <span>{{ p.name }}（{{ p.title }}）</span>
                <span v-if="p.contact" class="contact-badge">{{ p.contact }}</span>
              </div>
            </dd>
          </dl>
        </div>
        <div class="detail-section">
          <div class="section-title">开拓对象</div>
          <div v-for="t in detailRecord.targets" :key="t.name" class="detail-target">
            <div class="detail-target-name">{{ t.name }}</div>
            <div class="detail-target-meta">
              <span v-if="t.taxId">税号：{{ t.taxId }}</span>
              <span>{{ t.industry }}</span>
              <span>{{ t.province }} {{ t.city }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <div class="detail-text-block">
            <div class="detail-label">活动目的及成效</div>
            <p>{{ detailRecord.purpose }}</p>
          </div>
          <div v-if="detailRecord.feedback" class="detail-text-block" style="margin-top:12px">
            <div class="detail-label">反馈意见建议</div>
            <p>{{ detailRecord.feedback }}</p>
          </div>
          <div v-if="detailRecord.followUp" class="detail-text-block" style="margin-top:12px">
            <div class="detail-label">后续需跟进事项</div>
            <p>{{ detailRecord.followUp }}</p>
          </div>
        </div>
        <div v-if="detailRecord.status === 'approved'" class="detail-section">
          <div class="detail-approve-badge">
            <el-icon><CircleCheckFilled /></el-icon>
            <div>
              <div>{{ detailRecord.approveTime }} 由 <strong>{{ detailRecord.approver }}</strong> 审批通过</div>
              <div v-if="detailRecord.ccList?.length" style="margin-top:4px;font-size:12px;opacity:0.85">
                已抄送：{{ detailRecord.ccList.join('、') }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="detailRecord.status === 'rejected'" class="detail-section">
          <div class="detail-reject-badge">
            <el-icon><WarningFilled /></el-icon>
            <span>退回原因：{{ detailRecord.rejectReason }}</span>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- 导出提示 -->
    <el-dialog v-model="exportVisible" title="导出 Excel" width="400px" align-center>
      <div class="export-info">
        <el-icon class="export-icon"><Download /></el-icon>
        <div>即将导出 <strong>{{ filteredRecords.length }}</strong> 条记录的明细表</div>
        <div style="font-size:12px;color:var(--text-sub);margin-top:4px">
          包含字段：活动标题、填报人、部门、活动时间、活动形式、规模、牵头/配合部门、开拓对象、行业地区、我委/对方参与人员、活动目的、反馈建议、跟进事项、备注、状态等
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="doExport">确认导出</el-button>
        <el-button @click="exportVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from '@/stores/useStore.js'
import { industryList, activityTypeList } from '@/data/mockData.js'
import { Download, Filter, RefreshLeft, Search, View, CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'

const { state, deptList, staffList } = useStore()

const detailVisible = ref(false)
const detailRecord  = ref(null)
const exportVisible = ref(false)

const filters = ref({
  targetName: '',
  dateRange: [],
  activityType: '',
  industry: '',
  dept: '',
  reporter: '',
  status: '',
  staffMember: '',
  supportDept: '',
})

function resetFilters() {
  filters.value = { targetName: '', dateRange: [], activityType: '', industry: '', dept: '', reporter: '', status: '', staffMember: '', supportDept: '' }
}

// 只显示已通过的记录（查询模块仅供参考已通过审批的信息）
// 但 demo 展示全部，实际应过滤 approved
const allRecords = computed(() => state.records)

const filteredRecords = computed(() => {
  const f = filters.value
  return allRecords.value.filter(r => {
    if (f.targetName && !r.targets.some(t => t.name.includes(f.targetName))) return false
    if (f.dateRange && f.dateRange.length === 2) {
      if (r.dateStart < f.dateRange[0] || r.dateStart > f.dateRange[1]) return false
    }
    if (f.activityType && r.activityType !== f.activityType) return false
    if (f.industry && !r.targets.some(t => t.industry === f.industry)) return false
    if (f.dept && r.leadDept !== f.dept) return false
    if (f.reporter && r.reporter !== f.reporter) return false
    if (f.status && r.status !== f.status) return false
    if (f.staffMember && !r.ourStaff.includes(f.staffMember)) return false
    if (f.supportDept && !(r.supportDept || []).includes(f.supportDept)) return false
    return true
  })
})

// KPI 统计
const kpiCards = computed(() => {
  const all = filteredRecords.value
  const totalScale = all.reduce((s, r) => s + (r.scale || 0), 0)
  const uniqueTargets = new Set(all.flatMap(r => r.targets.map(t => t.name))).size
  const industries = new Set(all.flatMap(r => r.targets.map(t => t.industry))).size
  return [
    { label: '活动总数', value: all.length,    icon: 'Collection',      color: '#3b66f5', bg: '#edf2ff' },
    { label: '参与总人次', value: totalScale,  icon: 'UserFilled',       color: '#00b479', bg: '#e6f9f3' },
    { label: '开拓对象数', value: uniqueTargets, icon: 'OfficeBuilding', color: '#ff9900', bg: '#fff7e6' },
    { label: '覆盖行业数', value: industries,  icon: 'Histogram',        color: '#a855f7', bg: '#f5e8ff' },
  ]
})

const statusMap = { approved: '已通过', rejected: '已退回', pending: '待审批', draft: '草稿' }
const statusLabel = (s) => statusMap[s] || s

function viewDetail(rec) {
  detailRecord.value = rec
  detailVisible.value = true
}

function exportExcel() {
  exportVisible.value = true
}

function doExport() {
  exportVisible.value = false
  // Build CSV content
  const headers = ['ID','活动标题','填报人','填报部门','活动时间','活动形式','活动规模(人)','牵头部门','配合部门','开拓对象','行业','省份','城市','我委参与人员','对方参与人员','活动目的及成效','反馈意见建议','后续需跟进事项','备注','状态','审批人','审批时间']
  const rows = filteredRecords.value.map(r => [
    r.id,
    r.title,
    r.reporter,
    r.reporterDept,
    r.dateStart === r.dateEnd ? r.dateStart : `${r.dateStart}至${r.dateEnd}`,
    r.activityType,
    r.scale,
    r.leadDept,
    (r.supportDept || []).join('；'),
    r.targets.map(t => t.name).join('；'),
    r.targets.map(t => t.industry).join('；'),
    r.targets.map(t => t.province).join('；'),
    r.targets.map(t => t.city).join('；'),
    r.ourStaff.join('；'),
    (r.otherStaff || []).filter(p => p.name).map(p => p.title ? `${p.name}（${p.title}）` : p.name).join('；'),
    `"${(r.purpose || '').replace(/"/g, '""')}"`,
    `"${(r.feedback || '').replace(/"/g, '""')}"`,
    `"${(r.followUp || '').replace(/"/g, '""')}"`,
    `"${(r.remarks || '').replace(/"/g, '""')}"`,
    statusLabel(r.status),
    r.approver || '',
    r.approveTime || '',
  ])
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `业务拓展活动记录_${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${filteredRecords.value.length} 条记录`)
}
</script>

<style scoped>
.page-wrap { max-width: 1100px; margin: 0 auto; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--gap-20);
}
.page-title { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
.page-desc  { font-size: 13px; color: var(--text-sub); }

/* KPI */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-12);
  margin-bottom: var(--gap-16);
}
.kpi-card {
  background: var(--bg-card-solid);
  border: 1px solid var(--line-solid);
  border-radius: var(--radius-lg);
  padding: var(--gap-16);
  display: flex;
  align-items: center;
  gap: var(--gap-12);
}
.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.kpi-num   { font-size: 26px; font-weight: 800; color: var(--text-main); line-height: 1.1; }
.kpi-label { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

/* Search panel */
.search-panel {
  padding: var(--gap-20);
  margin-bottom: var(--gap-16);
}
.search-panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-regular);
  margin-bottom: var(--gap-16);
}
.filter-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}
.reset-btn { padding: 2px 8px; }

/* Table */
.table-wrap {
  padding: 0;
  overflow: hidden;
}
.table-title {
  color: var(--primary);
  cursor: pointer;
  font-weight: 500;
}
.table-title:hover { text-decoration: underline; }
.table-targets { display: flex; flex-direction: column; gap: 2px; }
.mini-target {
  font-size: 12px;
  color: var(--text-regular);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* Detail drawer */
.detail-section { margin-bottom: var(--gap-20); padding-bottom: var(--gap-20); border-bottom: 1px solid var(--line); }
.detail-section:last-child { border-bottom: none; }
.detail-status-bar { display: flex; align-items: center; justify-content: space-between; }
.detail-grid { display: grid; grid-template-columns: 96px 1fr; gap: 8px 16px; font-size: 13px; }
.detail-grid dt { color: var(--text-sub); }
.detail-grid dd { color: var(--text-main); font-weight: 500; }
.detail-target { padding: 10px 12px; background: #fafbff; border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--line); }
.detail-target-name { font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
.detail-target-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-sub); }
.detail-text-block { }
.detail-label { font-size: 12px; color: var(--text-sub); margin-bottom: 4px; }
.detail-text-block p { font-size: 13px; color: var(--text-main); line-height: 1.7; }
.other-person-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; font-size:13px; }
.contact-badge { font-size:11px; color:var(--primary); background:var(--primary-soft); padding:1px 8px; border-radius:var(--radius-full); white-space:nowrap; }
.detail-approve-badge, .detail-reject-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 10px 14px; border-radius: var(--radius-md); }
.detail-approve-badge { background: var(--success-soft); color: var(--success); }
.detail-reject-badge  { background: var(--danger-soft);  color: var(--danger); }

/* Export dialog */
.export-info { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: var(--gap-12) 0; font-size: 14px; color: var(--text-main); text-align: center; }
.export-icon { font-size: 40px; color: var(--primary); }
</style>
