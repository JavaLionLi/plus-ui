<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="商品id" prop="productId">
            <el-input v-model="queryParams.productId" placeholder="请输入商品id" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="请输入商品名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品单价/￥" prop="productPrice">
            <el-input v-model="queryParams.productPrice" placeholder="请输入商品单价" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['order:product:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['order:product:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['order:product:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['order:product:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="商品id" align="center" prop="productId" v-if="true" />
        <el-table-column label="商品名称" align="center" prop="productName" />
        <el-table-column label="商品规格" align="center" prop="productSpecification" />
        <el-table-column label="商品单价" align="center" prop="productPrice" />
        <el-table-column label="备注" align="center" prop="productRemarks" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:product:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:product:remove']"></el-button>
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
    <!-- 添加或修改商品对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="productFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品规格" prop="productSpecification">
          <el-input v-model="form.productSpecification" placeholder="请输入商品规格" />
        </el-form-item>
        <el-form-item label="商品单价" prop="productPrice">
          <el-input v-model="form.productPrice" placeholder="请输入商品单价" />
        </el-form-item>
        <el-form-item label="备注" prop="productRemarks">
            <el-input v-model="form.productRemarks" type="textarea" placeholder="请输入内容" />
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

<script setup name="Product" lang="ts">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from '@/api/order/product';
import { ProductVO, ProductQuery, ProductForm } from '@/api/order/product/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const productList = ref<ProductVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const productFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProductForm = {
  productName: undefined,
  productSpecification: undefined,
  productPrice: undefined,
  productRemarks: undefined,
}
const data = reactive<PageData<ProductForm, ProductQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productId: undefined,
    productName: undefined,
    productPrice: undefined,
    params: {
    }
  },
  rules: {
    productName: [
      { required: true, message: "商品名称不能为空", trigger: "blur" }
    ],
    productPrice: [
      { required: true, message: "商品单价不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商品列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProduct(queryParams.value);
  productList.value = res.rows;
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
  productFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProductVO[]) => {
  ids.value = selection.map(item => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加商品";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ProductVO) => {
  reset();
  const _productId = row?.productId || ids.value[0]
  const res = await getProduct(_productId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改商品";
}

/** 提交按钮 */
const submitForm = () => {
  productFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.productId) {
        await updateProduct(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProduct(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ProductVO) => {
  const _productIds = row?.productId || ids.value;
  await proxy?.$modal.confirm('是否确认删除商品编号为"' + _productIds + '"的数据项？').finally(() => loading.value = false);
  await delProduct(_productIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('order/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
