<template>
  <div class="page-wrap">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">登记活动</h2>
        <p class="page-desc">填写本次业务拓展活动的详细信息，提交后将推送至部门正职审批。</p>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent
    >
      <!-- ── 基本信息 ── -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="活动标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入本次活动的简要标题，如「走访XX公司法务部」" maxlength="60" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="填报人">
              <el-input :value="currentUser.name" disabled>
                <template #suffix><el-icon><Lock /></el-icon></template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="我委对接人" prop="contact">
              <el-select
                v-model="form.contact"
                filterable
                placeholder="输入姓名搜索"
                style="width:100%"
              >
                <el-option
                  v-for="s in staffList"
                  :key="s.id"
                  :label="`${s.name}（${s.dept}）`"
                  :value="s.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属部门（只读）">
              <el-input :value="currentUser.dept" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="牵头部门" prop="leadDept">
              <el-select v-model="form.leadDept" placeholder="请选择" style="width:100%">
                <el-option v-for="d in deptList" :key="d.id" :label="d.name" :value="d.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配合部门（非必填）">
              <el-select v-model="form.supportDept" placeholder="请选择（可不填）" clearable style="width:100%">
                <el-option v-for="d in deptList" :key="d.id" :label="d.name" :value="d.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── 活动信息 ── -->
      <div class="form-section">
        <div class="section-title">活动信息</div>
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="活动时间" prop="dateRange">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="活动形式" prop="activityType">
              <el-select v-model="form.activityType" placeholder="请选择" style="width:100%">
                <el-option v-for="t in activityTypeList" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="活动规模（人）" prop="scale">
              <el-input-number
                v-model="form.scale"
                :min="1"
                :max="9999"
                placeholder="人数"
                style="width:100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── 参与人员 ── -->
      <div class="form-section">
        <div class="section-title">参与人员</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="我委参与人员" prop="ourStaff">
              <el-select
                v-model="form.ourStaff"
                multiple
                filterable
                placeholder="输入姓名搜索并选择"
                style="width:100%"
              >
                <el-option
                  v-for="s in staffList"
                  :key="s.id"
                  :label="`${s.name}（${s.dept}）`"
                  :value="s.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="对方参与人员">
              <div class="dynamic-list">
                <div
                  v-for="(person, idx) in form.otherStaff"
                  :key="idx"
                  class="dynamic-row"
                >
                  <el-input
                    v-model="person.name"
                    placeholder="姓名"
                    style="width:90px;flex-shrink:0"
                  />
                  <el-input
                    v-model="person.title"
                    placeholder="职务，如：XX公司法务总监"
                    style="flex:1"
                  />
                  <el-button
                    v-if="form.otherStaff.length > 1"
                    type="danger"
                    link
                    :icon="Delete"
                    @click="removeOtherStaff(idx)"
                  />
                </div>
                <button type="button" class="btn-add-row" @click="addOtherStaff">
                  <el-icon><Plus /></el-icon> 添加人员
                </button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── 开拓对象 ── -->
      <div class="form-section">
        <div class="section-title">
          开拓对象信息
          <span class="section-hint">可添加多个</span>
        </div>
        <div
          v-for="(target, idx) in form.targets"
          :key="idx"
          class="target-card"
        >
          <div class="target-card-header">
            <span class="target-num">对象 {{ idx + 1 }}</span>
            <el-button
              v-if="form.targets.length > 1"
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="removeTarget(idx)"
            >删除</el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="10">
              <el-form-item
                :label="`名称`"
                :prop="`targets.${idx}.name`"
                :rules="[{ required: true, message: '请填写对象名称', trigger: 'blur' }]"
              >
                <el-input v-model="target.name" placeholder="机构/企业全称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`纳税人识别号`">
                <el-input v-model="target.taxId" placeholder="统一社会信用代码（选填）" maxlength="18" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="`所属行业`"
                :prop="`targets.${idx}.industry`"
                :rules="[{ required: true, message: '请选择行业', trigger: 'change' }]"
              >
                <el-select v-model="target.industry" placeholder="请选择" style="width:100%">
                  <el-option v-for="ind in industryList" :key="ind" :label="ind" :value="ind" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`所在省份`"
                :prop="`targets.${idx}.province`"
                :rules="[{ required: true, message: '请选择省份', trigger: 'change' }]"
              >
                <el-select
                  v-model="target.province"
                  placeholder="请选择省份"
                  style="width:100%"
                  @change="() => { target.city = '' }"
                >
                  <el-option v-for="r in regionData" :key="r.province" :label="r.province" :value="r.province" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`所在城市`"
                :prop="`targets.${idx}.city`"
                :rules="[{ required: true, message: '请选择城市', trigger: 'change' }]"
              >
                <el-select v-model="target.city" placeholder="请先选择省份" style="width:100%" :disabled="!target.province">
                  <el-option
                    v-for="city in getCities(target.province)"
                    :key="city"
                    :label="city"
                    :value="city"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <button type="button" class="btn-add-target" @click="addTarget">
          <el-icon><Plus /></el-icon> 添加开拓对象
        </button>
      </div>

      <!-- ── 活动详情 ── -->
      <div class="form-section">
        <div class="section-title">活动详情</div>
        <el-form-item label="活动目的及成效" prop="purpose">
          <el-input
            v-model="form.purpose"
            type="textarea"
            :rows="4"
            placeholder="如发现的潜在合作机会、行业开拓机遇、专家资源、对方核心需求等"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="反馈意见建议（非必填）">
          <el-input
            v-model="form.feedback"
            type="textarea"
            :rows="3"
            placeholder="如对仲裁服务、广仲发展的意见建议"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="后续需跟进事项（非必填）">
          <el-input
            v-model="form.followUp"
            type="textarea"
            :rows="3"
            placeholder="如需其他部门配合，可描述具体需求及跟进责任人"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </div>

      <!-- ── 附件与备注 ── -->
      <div class="form-section">
        <div class="section-title">佐证材料与备注</div>
        <el-form-item label="佐证材料（非必填）">
          <el-upload
            v-model:file-list="form.attachments"
            action="#"
            :auto-upload="false"
            multiple
            :limit="10"
            class="upload-area"
          >
            <template #trigger>
              <button type="button" class="btn-default">
                <el-icon><UploadFilled /></el-icon> 选择文件
              </button>
            </template>
            <template #tip>
              <div class="upload-tip">可上传活动方案、活动图片、达成的合作协议等，支持 PDF / Word / Excel / 图片，单文件不超过 20MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注（非必填）">
          <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="其他需要说明的内容" maxlength="200" show-word-limit />
        </el-form-item>
      </div>

      <!-- ── 提交区 ── -->
      <div class="form-footer">
        <button type="button" class="btn-default" @click="resetForm">
          <el-icon><RefreshLeft /></el-icon> 重置
        </button>
        <button type="button" class="btn-primary" @click="submitForm">
          <el-icon><Promotion /></el-icon> 提交审批
        </button>
      </div>
    </el-form>

    <!-- ── 提交成功弹窗 ── -->
    <el-dialog v-model="successVisible" title="提交成功" width="440px" align-center>
      <div class="success-body">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <div class="success-title">活动信息已提交</div>
        <div class="success-desc" v-if="submittedRecord?.status === 'approved'">
          您是部门正职，本次记录已<strong>自动审批通过</strong>，并已抄送战略发展部。
        </div>
        <div class="success-desc" v-else>
          已推送至 <strong>{{ approverName }}</strong> 进行审批，审批完成后将自动抄送战略发展部。
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="goToMyRecords">查看我的记录</el-button>
        <el-button @click="() => { successVisible = false; resetForm() }">继续填报</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Delete, Plus, Lock, UploadFilled, Promotion, RefreshLeft, CircleCheckFilled } from '@element-plus/icons-vue'
import { useStore } from '@/stores/useStore.js'
import { industryList, activityTypeList, regionData } from '@/data/mockData.js'

const router = useRouter()
const { currentUser, deptList, staffList, submitRecord } = useStore()

const formRef = ref()
const successVisible = ref(false)
const submittedRecord = ref(null)

const emptyForm = () => ({
  title: '',
  contact: currentUser.value.name,
  leadDept: currentUser.value.dept,
  supportDept: '',
  dateRange: [],
  activityType: '',
  scale: null,
  ourStaff: [currentUser.value.name],
  otherStaff: [{ name: '', title: '' }],
  targets: [{ name: '', taxId: '', industry: '', province: '', city: '' }],
  purpose: '',
  feedback: '',
  followUp: '',
  attachments: [],
  remarks: '',
})

const form = ref(emptyForm())

const rules = {
  title:        [{ required: true, message: '请填写活动标题', trigger: 'blur' }],
  contact:      [{ required: true, message: '请选择我委对接人', trigger: 'change' }],
  leadDept:     [{ required: true, message: '请选择牵头部门', trigger: 'change' }],
  dateRange:    [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  activityType: [{ required: true, message: '请选择活动形式', trigger: 'change' }],
  scale:        [{ required: true, message: '请填写活动规模', trigger: 'blur' }],
  ourStaff:     [{ required: true, type: 'array', min: 1, message: '请至少选择一名我委参与人员', trigger: 'change' }],
  purpose:      [{ required: true, message: '请填写活动目的及成效', trigger: 'blur' }],
}

// 获取城市列表
function getCities(province) {
  return regionData.find(r => r.province === province)?.cities || []
}

// 动态人员
function addOtherStaff() { form.value.otherStaff.push({ name: '', title: '' }) }
function removeOtherStaff(idx) { form.value.otherStaff.splice(idx, 1) }

// 动态对象
function addTarget() { form.value.targets.push({ name: '', taxId: '', industry: '', province: '', city: '' }) }
function removeTarget(idx) { form.value.targets.splice(idx, 1) }

// 审批人名称（展示用）
const approverName = computed(() => {
  const dept = deptList.find(d => d.name === form.value.leadDept)
  if (!dept) return '部门正职'
  return dept.head || (dept.deputy && dept.deputy[0]) || '部门正职'
})

async function submitForm() {
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请检查表单填写是否完整')
    return
  }

  const dateRange = form.value.dateRange || []
  const payload = {
    ...form.value,
    dateStart: dateRange[0] || '',
    dateEnd: dateRange[1] || '',
    otherStaff: form.value.otherStaff.filter(p => p.name.trim()),
  }
  submittedRecord.value = submitRecord(payload)
  successVisible.value = true
}

function resetForm() {
  form.value = emptyForm()
  formRef.value?.clearValidate()
}

function goToMyRecords() {
  successVisible.value = false
  router.push('/my-records')
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
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}
.page-desc { font-size: 13px; color: var(--text-sub); }

.section-hint {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-sub);
  margin-left: 6px;
}

/* Dynamic list */
.dynamic-list { display: flex; flex-direction: column; gap: 8px; }
.dynamic-row  { display: flex; align-items: center; gap: 8px; }
.btn-add-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px dashed var(--primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
  transition: opacity .2s;
  align-self: flex-start;
}
.btn-add-row:hover { opacity: .8; }

/* Target card */
.target-card {
  border: 1px solid var(--line-solid);
  border-radius: var(--radius-md);
  padding: var(--gap-16);
  margin-bottom: var(--gap-12);
  background: #fafbff;
}
.target-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-12);
}
.target-num {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}
.btn-add-target {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: transparent;
  color: var(--primary);
  border: 1px dashed var(--primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
  transition: background .2s;
  width: 100%;
  justify-content: center;
}
.btn-add-target:hover { background: var(--primary-soft); }

/* Upload */
.upload-area :deep(.el-upload-list) { margin-top: 8px; }
.upload-tip { font-size: 12px; color: var(--text-sub); margin-top: 6px; }

/* Footer */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--gap-12);
  padding: var(--gap-16) 0 var(--gap-8);
}

/* Success dialog */
.success-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--gap-16) 0;
  gap: var(--gap-12);
}
.success-icon {
  font-size: 56px;
  color: var(--success);
}
.success-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}
.success-desc {
  font-size: 14px;
  color: var(--text-regular);
  text-align: center;
  line-height: 1.6;
}
</style>
