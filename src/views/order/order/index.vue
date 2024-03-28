<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="订单id" prop="orderId">
            <el-input v-model="queryParams.orderId" placeholder="请输入订单id" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品id" prop="productId">
            <el-select v-model="queryParams.productId" placeholder="请选择商品id" clearable>
              <el-option
                v-for="dict in fms_product_name"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="用户id" prop="usrId">
            <el-input v-model="queryParams.usrId" placeholder="请输入用户id" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品数量" prop="productNum">
            <el-input v-model="queryParams.productNum" placeholder="请输入商品数量" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker
                v-model="dateRangeCreateTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['order:order:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['order:order:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['order:order:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['order:order:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="订单id" align="center" prop="orderId" v-if="true" />
        <el-table-column label="商品id" align="center" prop="productId">
          <template #default="scope">
            <dict-tag :options="fms_product_name" :value="scope.row.productId"/>
          </template>
        </el-table-column>
        <el-table-column label="用户id" align="center" prop="usrId" />
        <el-table-column label="商品数量" align="center" prop="productNum" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:order:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:order:remove']"></el-button>
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
    <!-- 添加或修改订单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="orderFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品id" prop="productId">
          <el-select v-model="form.productId" placeholder="请选择商品id">
            <el-option
                v-for="dict in fms_product_name"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户id" prop="usrId">
          <el-input v-model="form.usrId" placeholder="请输入用户id" />
        </el-form-item>
        <el-form-item label="商品数量" prop="productNum">
          <el-input v-model="form.productNum" placeholder="请输入商品数量" />
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

<script setup name="Order" lang="ts">
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from '@/api/order/order';
import { OrderVO, OrderQuery, OrderForm } from '@/api/order/order/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { fms_product_name } = toRefs<any>(proxy?.useDict('fms_product_name'));

const orderList = ref<OrderVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const orderFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OrderForm = {
  orderId: undefined,
  productId: undefined,
  usrId: undefined,
  productNum: undefined,
}
const data = reactive<PageData<OrderForm, OrderQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    productId: undefined,
    usrId: undefined,
    productNum: undefined,
    params: {
      createTime: undefined,
    }
  },
  rules: {
    orderId: [
      { required: true, message: "订单id不能为空", trigger: "blur" }
    ],
    productId: [
      { required: true, message: "商品id不能为空", trigger: "change" }
    ],
    usrId: [
      { required: true, message: "用户id不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  const res = await listOrder(queryParams.value);
  orderList.value = res.rows;
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
  orderFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: OrderVO[]) => {
  ids.value = selection.map(item => item.orderId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加订单";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: OrderVO) => {
  reset();
  const _orderId = row?.orderId || ids.value[0]
  const res = await getOrder(_orderId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改订单";
}

/** 提交按钮 */
const submitForm = () => {
  orderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.orderId) {
        await updateOrder(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addOrder(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: OrderVO) => {
  const _orderIds = row?.orderId || ids.value;
  await proxy?.$modal.confirm('是否确认删除订单编号为"' + _orderIds + '"的数据项？').finally(() => loading.value = false);
  await delOrder(_orderIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('order/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
