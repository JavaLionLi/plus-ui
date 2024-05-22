<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="商户id" prop="merchantId">
            <el-input v-model="queryParams.merchantId" placeholder="请输入商户id" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="负责人" prop="userId">
            <el-select v-model="queryParams.userId" placeholder="请选择负责人" clearable>
              <el-option
                v-for="dict in fms_user_name"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商户等级" prop="level">
            <el-select v-model="queryParams.level" placeholder="请选择商户等级" clearable>
              <el-option
                v-for="dict in fms_merchant_level"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商户地址" prop="merchantAddress">
            <el-input v-model="queryParams.merchantAddress" placeholder="请输入商户地址" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商户状态" prop="merchantStatus">
            <el-select v-model="queryParams.merchantStatus" placeholder="请选择商户状态" clearable>
              <el-option
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['merchant:merchant:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['merchant:merchant:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['merchant:merchant:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['merchant:merchant:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="merchantList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="商户id" align="center" prop="merchantId" v-if="true" />
        <el-table-column label="负责人" align="center" prop="userId">
          <template #default="scope">
            <dict-tag :options="fms_user_name" :value="scope.row.userId"/>
          </template>
        </el-table-column>
        <el-table-column label="商户等级" align="center" prop="level">
          <template #default="scope">
            <dict-tag :options="fms_merchant_level" :value="scope.row.level"/>
          </template>
        </el-table-column>
        <el-table-column label="商户地址" align="center" prop="merchantAddress" />
        <el-table-column label="商户状态" align="center" prop="merchantStatus">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.merchantStatus"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['merchant:merchant:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['merchant:merchant:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </el-card>
    <!-- 添加或修改商户管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="merchantFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="负责人" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择负责人">
            <el-option
                v-for="dict in fms_user_name"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商户等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择商户等级">
            <el-option
                v-for="dict in fms_merchant_level"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商户地址" prop="merchantAddress">
          <el-input v-model="form.merchantAddress" placeholder="请输入商户地址" />
        </el-form-item>
        <el-form-item label="商户状态" prop="merchantStatus">
          <el-radio-group v-model="form.merchantStatus">
            <el-radio
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Merchant" lang="ts">
import { listMerchant, getMerchant, delMerchant, addMerchant, updateMerchant } from '@/api/merchant/merchant';
import { MerchantVO, MerchantQuery, MerchantForm } from '@/api/merchant/merchant/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { fms_user_name, sys_normal_disable, fms_merchant_level } = toRefs<any>(proxy?.useDict('fms_user_name', 'sys_normal_disable', 'fms_merchant_level'));

const merchantList = ref<MerchantVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const merchantFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MerchantForm = {
  merchantId: undefined,
  userId: undefined,
  level: undefined,
  merchantAddress: undefined,
  merchantStatus: undefined
}
const data = reactive<PageData<MerchantForm, MerchantQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantId: undefined,
    userId: undefined,
    level: undefined,
    merchantAddress: undefined,
    merchantStatus: undefined,
    params: {
    }
  },
  rules: {
    merchantId: [
      { required: true, message: "商户id不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商户管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMerchant(queryParams.value);
  merchantList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  merchantFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: MerchantVO[]) => {
  ids.value = selection.map(item => item.merchantId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加商户";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: MerchantVO) => {
  reset();
  const _merchantId = row?.merchantId || ids.value[0]
  const res = await getMerchant(_merchantId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改商户";
}

/** 提交按钮 */
const submitForm = () => {
  merchantFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.merchantId) {
        await updateMerchant(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addMerchant(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: MerchantVO) => {
  const _merchantIds = row?.merchantId || ids.value;
  await proxy?.$modal.confirm('是否确认删除商户管理编号为"' + _merchantIds + '"的数据项？').finally(() => loading.value = false);
  await delMerchant(_merchantIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('merchant/merchant/export', {
    ...queryParams.value
  }, `merchant_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
