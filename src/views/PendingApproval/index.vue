<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h2 class="page-title">待我审批</h2>
        <p class="page-desc">审批本部门干部职工提交的业务拓展活动信息。审批通过后自动抄送战略发展部。</p>
      </div>
      <div v-if="pendingRecords.length > 0" class="pending-badge-large">
        {{ pendingRecords.length }} 条待审批
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="pendingRecords.length === 0" class="empty-state">
      <el-icon class="empty-icon"><CircleCheckFilled /></el-icon>
      <p class="empty-title">暂无待审批记录</p>
      <p class="empty-sub">所有记录均已处理完毕</p>
    </div>

    <!-- 审批列表 -->
    <div v-else class="approval-list">
      <div
        v-for="rec in pendingRecords"
        :key="rec.id"
        class="approval-card"
      >
        <div class="approval-card-main">
          <!-- 左侧：活动信息 -->
          <div class="approval-info">
            <div class="approval-title-row">
              <span class="approval-title">{{ rec.title }}</span>
              <span class="tag tag-pending">待审批</span>
            </div>
            <div class="approval-meta">
              <span class="meta-item">
                <el-icon><UserFilled /></el-icon>
                <strong>{{ rec.reporter }}</strong>
                <em>{{ rec.reporterDept }}</em>
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ rec.dateStart }}{{ rec.dateEnd !== rec.dateStart ? ' 至 ' + rec.dateEnd : '' }}
              </span>
              <span class="meta-item">
                <el-icon><Collection /></el-icon>
                {{ rec.activityType }}
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                提交于 {{ rec.submitTime }}
              </span>
            </div>

            <!-- 开拓对象 -->
            <div class="approval-targets">
              <span v-for="t in rec.targets" :key="t.name" class="target-tag">
                {{ t.name }} · {{ t.industry }} · {{ t.city }}
              </span>
            </div>

            <!-- 活动目的摘要 -->
            <div class="approval-purpose">
              <span class="purpose-label">活动目的：</span>
              <span class="purpose-text">{{ truncate(rec.purpose, 120) }}</span>
            </div>
          </div>

          <!-- 右侧：操作 -->
          <div class="approval-actions">
            <button class="btn-text" style="margin-bottom:8px" @click="viewDetail(rec)">
              <el-icon><View /></el-icon> 查看全文
            </button>
            <button class="btn-approve" @click="handleApprove(rec)">
              <el-icon><CircleCheckFilled /></el-icon> 审批通过
            </button>
            <button class="btn-reject" @click="openRejectDialog(rec)">
              <el-icon><CircleCloseFilled /></el-icon> 退回修改
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情抽屉（复用） -->
    <el-drawer v-model="detailVisible" :title="detailRecord?.title" size="600px" direction="rtl">
      <template v-if="detailRecord">
        <div class="detail-section">
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
        <div v-if="detailRecord.status === 'pending'" class="drawer-footer">
          <button class="btn-approve" @click="handleApprove(detailRecord); detailVisible = false">
            <el-icon><CircleCheckFilled /></el-icon> 审批通过
          </button>
          <button class="btn-reject" @click="openRejectDialog(detailRecord); detailVisible = false">
            <el-icon><CircleCloseFilled /></el-icon> 退回修改
          </button>
        </div>
      </template>
    </el-drawer>

    <!-- 抄送确认弹窗 -->
    <el-dialog v-model="ccVisible" title="审批并抄送" width="480px" align-center>
      <div class="cc-dialog-body">
        <div class="cc-auto-tip">
          <el-icon style="color:var(--success)"><CircleCheckFilled /></el-icon>
          <span>审批通过后将自动抄送 <strong>余莨桢</strong>（战略发展部正职）</span>
        </div>
        <div class="cc-manual-label">是否额外抄送本部门其他成员？（可不选）</div>
        <el-select
          v-model="ccSelected"
          multiple
          filterable
          placeholder="输入姓名搜索并选择"
          style="width:100%"
        >
          <el-option
            v-for="s in ccDeptStaff"
            :key="s.id"
            :label="`${s.name}（${s.title}）`"
            :value="s.name"
          />
        </el-select>
      </div>
      <template #footer>
        <el-button type="primary" @click="doApprove">确认审批通过</el-button>
        <el-button @click="ccVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 退回对话框 -->
    <el-dialog v-model="rejectVisible" title="退回修改" width="480px" align-center>
      <div style="margin-bottom:8px;color:var(--text-regular);font-size:13px">
        请填写退回原因，将通知填报人 <strong>{{ rejectTarget?.reporter }}</strong> 修改后重新提交。
      </div>
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请说明需要修改或补充的具体内容……"
        maxlength="300"
        show-word-limit
      />
      <template #footer>
        <el-button type="danger" :disabled="!rejectReason.trim()" @click="doReject">确认退回</el-button>
        <el-button @click="rejectVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from '@/stores/useStore.js'
import { UserFilled, Calendar, Collection, Timer, View, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const { pendingRecords, currentUser, staffList, approveRecord, rejectRecord } = useStore()

const detailVisible = ref(false)
const detailRecord  = ref(null)
const rejectVisible = ref(false)
const rejectTarget  = ref(null)
const rejectReason  = ref('')

// CC 弹窗状态
const ccVisible  = ref(false)
const ccTarget   = ref(null)
const ccSelected = ref([])

// 可选抄送人：当前用户所在部门，排除余莨桢（已自动抄送）和当前用户自身
const ccDeptStaff = computed(() =>
  staffList.filter(s =>
    s.dept === currentUser.value.dept &&
    s.name !== '余莨桢' &&
    s.name !== currentUser.value.name
  )
)

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n) + '…' : str
}

function viewDetail(rec) {
  detailRecord.value = rec
  detailVisible.value = true
}

// 点击"审批通过"→打开 CC 弹窗，预选副职
function handleApprove(rec) {
  ccTarget.value = rec
  ccSelected.value = ccDeptStaff.value
    .filter(s => s.role === 'deputy')
    .map(s => s.name)
  ccVisible.value = true
}

// CC 弹窗确认后执行审批
function doApprove() {
  approveRecord(ccTarget.value.id, ccSelected.value)
  ccVisible.value = false
  const ccNames = ['余莨桢', ...ccSelected.value].join('、')
  ElMessage.success(`「${ccTarget.value.title}」已审批通过，已抄送：${ccNames}`)
  if (detailVisible.value) detailVisible.value = false
}

function openRejectDialog(rec) {
  rejectTarget.value = rec
  rejectReason.value = ''
  rejectVisible.value = true
}

function doReject() {
  rejectRecord(rejectTarget.value.id, rejectReason.value.trim())
  rejectVisible.value = false
  ElMessage.warning(`已退回至 ${rejectTarget.value.reporter}，请其修改后重新提交`)
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

.pending-badge-large {
  background: #fff3e0;
  color: var(--warning);
  border: 1px solid #ffe0b2;
  border-radius: var(--radius-full);
  padding: 6px 18px;
  font-size: 14px;
  font-weight: 600;
}

/* Empty */
.empty-state { text-align: center; padding: 80px 0; }
.empty-icon  { font-size: 56px; color: var(--success); display: block; margin-bottom: 16px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--text-main); }
.empty-sub   { font-size: 13px; color: var(--text-sub); margin-top: 6px; }

/* Approval cards */
.approval-list { display: flex; flex-direction: column; gap: var(--gap-16); }
.approval-card {
  background: var(--bg-card-solid);
  border: 1px solid var(--line-solid);
  border-left: 4px solid var(--warning);
  border-radius: var(--radius-lg);
  padding: var(--gap-24);
  transition: box-shadow .2s;
}
.approval-card:hover { box-shadow: var(--shadow-card); }
.approval-card-main  { display: flex; gap: var(--gap-20); }
.approval-info       { flex: 1; min-width: 0; }

.approval-title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-10);
  margin-bottom: 8px;
}
.approval-title { font-size: 16px; font-weight: 700; color: var(--text-main); flex: 1; }

.approval-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 12px;
  color: var(--text-sub);
}
.meta-item { display: flex; align-items: center; gap: 4px; }
.meta-item strong { color: var(--text-main); font-weight: 600; }
.meta-item em { font-style: normal; color: var(--text-sub); margin-left: 2px; }

.approval-targets {
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

.approval-purpose { font-size: 13px; color: var(--text-regular); line-height: 1.6; }
.purpose-label    { color: var(--text-sub); }

/* Action buttons */
.approval-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  width: 110px;
}
.btn-approve, .btn-reject {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 0;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity .2s;
}
.btn-approve { background: var(--success); color: #fff; }
.btn-approve:hover { opacity: .85; }
.btn-reject { background: var(--danger-soft); color: var(--danger); border: 1px solid #ffc5c5; }
.btn-reject:hover { background: var(--danger); color: #fff; }

/* Detail drawer */
.detail-section { margin-bottom: var(--gap-20); padding-bottom: var(--gap-20); border-bottom: 1px solid var(--line); }
.detail-section:last-child { border-bottom: none; }
.detail-grid { display: grid; grid-template-columns: 96px 1fr; gap: 8px 16px; font-size: 13px; }
.detail-grid dt { color: var(--text-sub); }
.detail-grid dd { color: var(--text-main); font-weight: 500; }
.detail-target { padding: 10px 12px; background: #fafbff; border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--line); }
.detail-target-name { font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
.detail-target-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-sub); }
.detail-text-block { }
.detail-label { font-size: 12px; color: var(--text-sub); margin-bottom: 4px; }
.detail-text-block p { font-size: 13px; color: var(--text-main); line-height: 1.7; }
.drawer-footer { display: flex; gap: var(--gap-12); margin-top: var(--gap-16); }

/* CC dialog */
.cc-dialog-body { display: flex; flex-direction: column; gap: var(--gap-16); }
.cc-auto-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--success-soft);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--text-regular);
}
.cc-manual-label { font-size: 13px; color: var(--text-sub); margin-bottom: -4px; }
</style>
