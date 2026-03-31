<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h2 class="page-title">我的记录</h2>
        <p class="page-desc">查看您提交的全部业务拓展活动记录及审批状态。</p>
      </div>
      <router-link to="/register">
        <button class="btn-primary"><el-icon><Plus /></el-icon> 新建活动</button>
      </router-link>
    </div>

    <!-- 状态统计卡片 -->
    <div class="stat-row">
      <div class="stat-card" v-for="s in statusStats" :key="s.label" :class="`stat-card--${s.type}`">
        <div class="stat-num">{{ s.count }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- 筛选 Tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ 'filter-tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- 记录列表 -->
    <div v-if="filteredRecords.length === 0" class="empty-state">
      <el-icon class="empty-icon"><DocumentRemove /></el-icon>
      <p>暂无记录</p>
    </div>

    <div v-else class="record-list">
      <div
        v-for="rec in filteredRecords"
        :key="rec.id"
        class="record-card"
        :class="`record-card--${rec.status}`"
      >
        <div class="record-card-header">
          <div class="record-title-row">
            <span class="record-title">{{ rec.title }}</span>
            <span :class="['tag', `tag-${rec.status}`]">
              {{ statusLabel(rec.status) }}
            </span>
          </div>
          <div class="record-meta">
            <span><el-icon><Calendar /></el-icon> {{ rec.dateStart }}{{ rec.dateEnd !== rec.dateStart ? ' 至 ' + rec.dateEnd : '' }}</span>
            <span><el-icon><Collection /></el-icon> {{ rec.activityType }}</span>
            <span><el-icon><OfficeBuilding /></el-icon> {{ rec.leadDept }}</span>
            <span><el-icon><UserFilled /></el-icon> 提交于 {{ rec.submitTime }}</span>
          </div>
        </div>

        <!-- 开拓对象 -->
        <div class="record-targets">
          <span v-for="t in rec.targets" :key="t.name" class="target-tag">
            {{ t.name }}
            <em v-if="t.industry">· {{ t.industry }}</em>
          </span>
        </div>

        <!-- 退回原因 -->
        <div v-if="rec.status === 'rejected'" class="reject-reason">
          <el-icon><WarningFilled /></el-icon>
          <span><strong>退回原因：</strong>{{ rec.rejectReason }}</span>
        </div>

        <!-- 审批信息 -->
        <div v-if="rec.status === 'approved'" class="approve-info">
          <el-icon><CircleCheckFilled /></el-icon>
          <div>
            <div>{{ rec.approveTime }} 由 <strong>{{ rec.approver }}</strong> 审批通过
              <span v-if="rec._autoApproved" class="auto-tag">自动通过</span>
            </div>
            <div v-if="rec.ccList?.length" style="font-size:12px;margin-top:2px;opacity:0.85">
              已抄送：{{ rec.ccList.join('、') }}
            </div>
          </div>
        </div>

        <!-- 操作 -->
        <div class="record-actions">
          <button class="btn-text" @click="viewDetail(rec)">
            <el-icon><View /></el-icon> 查看详情
          </button>
          <button
            v-if="rec.status === 'pending'"
            class="btn-danger-text"
            @click="confirmWithdraw(rec)"
          >
            <el-icon><RefreshLeft /></el-icon> 撤回
          </button>
          <button
            v-if="rec.status === 'rejected' || rec.status === 'draft'"
            class="btn-text"
            @click="editRecord(rec)"
          >
            <el-icon><EditPen /></el-icon> 修改重提
          </button>
        </div>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailVisible"
      :title="detailRecord?.title"
      size="600px"
      direction="rtl"
    >
      <template v-if="detailRecord">
        <div class="detail-section">
          <div class="detail-status-bar">
            <span :class="['tag', `tag-${detailRecord.status}`]" style="font-size:14px;padding:4px 14px">
              {{ statusLabel(detailRecord.status) }}
            </span>
            <span class="detail-time">提交时间：{{ detailRecord.submitTime }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <dl class="detail-grid">
            <dt>填报人</dt>     <dd>{{ detailRecord.reporter }}（{{ detailRecord.reporterDept }}）</dd>
            <dt>我委对接人</dt> <dd>{{ detailRecord.contact }}</dd>
            <dt>牵头部门</dt>   <dd>{{ detailRecord.leadDept }}</dd>
            <dt>配合部门</dt>   <dd>{{ detailRecord.supportDept?.length ? detailRecord.supportDept.join('、') : '—' }}</dd>
          </dl>
        </div>

        <div class="detail-section">
          <div class="section-title">活动信息</div>
          <dl class="detail-grid">
            <dt>活动时间</dt>
            <dd>{{ detailRecord.dateStart }}{{ detailRecord.dateEnd !== detailRecord.dateStart ? ' 至 ' + detailRecord.dateEnd : '' }}</dd>
            <dt>活动形式</dt> <dd>{{ detailRecord.activityType }}</dd>
            <dt>活动规模</dt> <dd>{{ detailRecord.scale }} 人</dd>
          </dl>
        </div>

        <div class="detail-section">
          <div class="section-title">参与人员</div>
          <dl class="detail-grid">
            <dt>我委参与人员</dt>
            <dd>{{ detailRecord.ourStaff.join('、') }}</dd>
            <dt v-if="detailRecord.ourLeaders?.length">出席领导</dt>
            <dd v-if="detailRecord.ourLeaders?.length">{{ detailRecord.ourLeaders.join('、') }}</dd>
            <dt>对方参与人员</dt>
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
          <div class="section-title">活动详情</div>
          <div class="detail-text-block">
            <div class="detail-label">活动目的及成效</div>
            <p>{{ detailRecord.purpose }}</p>
          </div>
          <div v-if="detailRecord.feedback" class="detail-text-block">
            <div class="detail-label">反馈意见建议</div>
            <p>{{ detailRecord.feedback }}</p>
          </div>
          <div v-if="detailRecord.followUp" class="detail-text-block">
            <div class="detail-label">后续需跟进事项</div>
            <p>{{ detailRecord.followUp }}</p>
          </div>
          <div v-if="detailRecord.remarks" class="detail-text-block">
            <div class="detail-label">备注</div>
            <p>{{ detailRecord.remarks }}</p>
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

    <!-- 撤回确认 -->
    <el-dialog v-model="withdrawVisible" title="确认撤回" width="380px" align-center>
      <p style="color:var(--text-regular)">确认撤回「{{ withdrawTarget?.title }}」？撤回后记录将变为草稿状态，可重新修改提交。</p>
      <template #footer>
        <el-button type="danger" @click="doWithdraw">确认撤回</el-button>
        <el-button @click="withdrawVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from '@/stores/useStore.js'
import { Plus, Calendar, Collection, OfficeBuilding, UserFilled, View, RefreshLeft, EditPen,
         DocumentRemove, CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const { myRecords, withdrawRecord } = useStore()

const activeTab = ref('all')
const detailVisible = ref(false)
const detailRecord = ref(null)
const withdrawVisible = ref(false)
const withdrawTarget = ref(null)

const statusMap = {
  pending:  { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已退回', type: 'danger' },
  draft:    { label: '草稿',   type: 'info' },
}
const statusLabel = (s) => statusMap[s]?.label || s

const statusStats = computed(() => [
  { label: '全部', count: myRecords.value.length, type: 'all' },
  { label: '待审批', count: myRecords.value.filter(r => r.status === 'pending').length,  type: 'warning' },
  { label: '已通过', count: myRecords.value.filter(r => r.status === 'approved').length, type: 'success' },
  { label: '已退回', count: myRecords.value.filter(r => r.status === 'rejected').length, type: 'danger' },
])

const filterTabs = computed(() => [
  { value: 'all',      label: '全部',   count: myRecords.value.length },
  { value: 'pending',  label: '待审批', count: myRecords.value.filter(r => r.status === 'pending').length },
  { value: 'approved', label: '已通过', count: myRecords.value.filter(r => r.status === 'approved').length },
  { value: 'rejected', label: '已退回', count: myRecords.value.filter(r => r.status === 'rejected').length },
])

const filteredRecords = computed(() =>
  activeTab.value === 'all'
    ? myRecords.value
    : myRecords.value.filter(r => r.status === activeTab.value)
)

function viewDetail(rec) {
  detailRecord.value = rec
  detailVisible.value = true
}

function confirmWithdraw(rec) {
  withdrawTarget.value = rec
  withdrawVisible.value = true
}

function doWithdraw() {
  withdrawRecord(withdrawTarget.value.id)
  withdrawVisible.value = false
  ElMessage.success('已撤回，记录已变为草稿状态')
}

function editRecord(rec) {
  // Navigate to register with pre-filled data (simplified: just navigate)
  router.push({ path: '/register', query: { editId: rec.id } })
}
</script>

<style scoped>
.page-wrap { max-width: 900px; margin: 0 auto; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--gap-20);
}
.page-title { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
.page-desc  { font-size: 13px; color: var(--text-sub); }

/* Stat row */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-12);
  margin-bottom: var(--gap-20);
}
.stat-card {
  background: var(--bg-card-solid);
  border-radius: var(--radius-lg);
  padding: var(--gap-16) var(--gap-20);
  border: 1px solid var(--line-solid);
  text-align: center;
}
.stat-card--warning { border-top: 3px solid var(--warning); }
.stat-card--success { border-top: 3px solid var(--success); }
.stat-card--danger  { border-top: 3px solid var(--danger); }
.stat-card--all     { border-top: 3px solid var(--primary); }
.stat-num   { font-size: 28px; font-weight: 800; color: var(--text-main); line-height: 1.1; }
.stat-label { font-size: 12px; color: var(--text-sub); margin-top: 4px; }

/* Filter tabs */
.filter-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: var(--gap-16);
}
.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: var(--bg-card-solid);
  border: 1px solid var(--line-solid);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-regular);
  cursor: pointer;
  transition: all .15s;
}
.filter-tab:hover { border-color: var(--primary); color: var(--primary); }
.filter-tab--active { background: var(--primary); border-color: var(--primary); color: #fff; }
.filter-tab--active .tab-count { background: rgba(255,255,255,0.25); color: #fff; }
.tab-count {
  background: var(--info-soft);
  color: var(--text-sub);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-sub);
}
.empty-icon { font-size: 48px; margin-bottom: 12px; display: block; }

/* Record cards */
.record-list { display: flex; flex-direction: column; gap: var(--gap-12); }
.record-card {
  background: var(--bg-card-solid);
  border: 1px solid var(--line-solid);
  border-radius: var(--radius-lg);
  padding: var(--gap-20) var(--gap-24);
  border-left: 4px solid transparent;
  transition: box-shadow .2s;
}
.record-card:hover { box-shadow: var(--shadow-card); }
.record-card--pending  { border-left-color: var(--warning); }
.record-card--approved { border-left-color: var(--success); }
.record-card--rejected { border-left-color: var(--danger); }
.record-card--draft    { border-left-color: var(--info); }

.record-card-header { margin-bottom: var(--gap-12); }
.record-title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-10);
  margin-bottom: 8px;
}
.record-title { font-size: 15px; font-weight: 600; color: var(--text-main); flex: 1; }
.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-12);
  font-size: 12px;
  color: var(--text-sub);
}
.record-meta span { display: flex; align-items: center; gap: 4px; }
.record-targets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--gap-16);
}
.target-tag {
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}
.target-tag em { font-style: normal; color: var(--text-sub); }

.reject-reason, .approve-info {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--gap-12);
}
.reject-reason  { background: var(--danger-soft);  color: var(--danger); }
.approve-info   { background: var(--success-soft); color: var(--success); }
.auto-tag {
  font-size: 11px;
  background: var(--success);
  color: #fff;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  margin-left: 4px;
}

.record-actions { display: flex; gap: var(--gap-4); padding-top: var(--gap-12); border-top: 1px solid var(--line); }

/* Detail drawer */
.detail-section { margin-bottom: var(--gap-20); padding-bottom: var(--gap-20); border-bottom: 1px solid var(--line); }
.detail-section:last-child { border-bottom: none; }
.detail-status-bar { display: flex; align-items: center; justify-content: space-between; }
.detail-time { font-size: 12px; color: var(--text-sub); }

.detail-grid {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px 16px;
  font-size: 13px;
}
.detail-grid dt { color: var(--text-sub); }
.detail-grid dd { color: var(--text-main); font-weight: 500; }

.detail-target {
  padding: 10px 12px;
  background: #fafbff;
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  border: 1px solid var(--line);
}
.detail-target-name { font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
.detail-target-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-sub); }

.detail-text-block { margin-bottom: var(--gap-12); }
.detail-label { font-size: 12px; color: var(--text-sub); margin-bottom: 4px; }
.detail-text-block p { font-size: 13px; color: var(--text-main); line-height: 1.7; }

.other-person-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; font-size:13px; }
.contact-badge { font-size:11px; color:var(--primary); background:var(--primary-soft); padding:1px 8px; border-radius:var(--radius-full); white-space:nowrap; }
.detail-approve-badge, .detail-reject-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
}
.detail-approve-badge { background: var(--success-soft); color: var(--success); }
.detail-reject-badge  { background: var(--danger-soft);  color: var(--danger); }
</style>
