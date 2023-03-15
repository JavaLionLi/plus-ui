<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="套餐名称" prop="packageName">
        <el-input
          v-model="queryParams.packageName"
          placeholder="请输入套餐名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:tenantPackage:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:tenantPackage:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:tenantPackage:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:tenantPackage:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tenantPackageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="租户套餐id" align="center" prop="packageId" v-if="false"/>
      <el-table-column label="套餐名称" align="center" prop="packageName" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center" prop="status" >
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:tenantPackage:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:tenantPackage:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改租户套餐对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tenantPackageRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="套餐名称" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="关联菜单">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuRef"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="TenantPackage">
import { listTenantPackage, getTenantPackage, delTenantPackage, addTenantPackage, updateTenantPackage, changePackageStatus } from "@/api/system/tenantPackage";
import { treeselect as menuTreeselect, tenantPackageMenuTreeselect } from "@/api/system/menu";

const { proxy } = getCurrentInstance();

const tenantPackageList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    packageName: undefined,
    status: undefined,
  },
  rules: {
    packageId: [
      { required: true, message: "租户套餐id不能为空", trigger: "blur" }
    ],
    packageName: [
      { required: true, message: "套餐名称不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询菜单树结构 */
function getMenuTreeselect() {
  menuTreeselect().then(response => {
    menuOptions.value = response.data;
  });
}

// 所有菜单节点数据
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = proxy.$refs.menuRef.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = proxy.$refs.menuRef.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}

/** 根据租户套餐ID查询菜单树结构 */
function getPackageMenuTreeselect(packageId) {
  return tenantPackageMenuTreeselect(packageId).then(response => {
    menuOptions.value = response.data.menus;
    return response;
  });
}

/** 查询租户套餐列表 */
function getList() {
  loading.value = true;
  listTenantPackage(queryParams.value).then(response => {
    tenantPackageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 租户套餐状态修改
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.packageName + '"套餐吗？').then(function() {
    return changePackageStatus(row.packageId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function() {
    row.status = row.status === "0" ? "1" : "0";
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  if (proxy.$refs.menuRef != undefined) {
    proxy.$refs.menuRef.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  form.value = {
    packageId: undefined,
    packageName: undefined,
    menuIds: undefined,
    remark: undefined,
    menuCheckStrictly: true,
    status: undefined
  };
  proxy.resetForm("tenantPackageRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.packageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

// 树权限（展开/折叠）
function handleCheckedTreeExpand(value, type) {
  if (type == 'menu') {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      proxy.$refs.menuRef.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
}

// 树权限（全选/全不选）
function handleCheckedTreeNodeAll(value, type) {
  if (type == 'menu') {
    proxy.$refs.menuRef.setCheckedNodes(value ? this.menuOptions: []);
  }
}

// 树权限（父子联动）
function handleCheckedTreeConnect(value, type) {
  if (type == 'menu') {
    form.value.menuCheckStrictly = value ? true: false;
  }
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getMenuTreeselect();
  open.value = true;
  title.value = "添加租户套餐";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  loading.value = true
  reset();
  const _packageId = row.packageId || ids.value
  const packageMenu = getPackageMenuTreeselect(_packageId);
  getTenantPackage(_packageId).then(response => {
    loading.value = false;
    form.value = response.data;
    open.value = true;
    nextTick(() => {
      packageMenu.then(res => {
        let checkedKeys = res.data.checkedKeys
        checkedKeys.forEach((v) => {
          nextTick(() => {
            proxy.$refs.menuRef.setChecked(v, true ,false);
          })
        })
      });
    });
    title.value = "修改租户套餐";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tenantPackageRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.packageId != null) {
        form.value.menuIds = getMenuAllCheckedKeys();
        updateTenantPackage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        form.value.menuIds = getMenuAllCheckedKeys();
        addTenantPackage(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _packageIds = row.packageId || ids.value;
  proxy.$modal.confirm('是否确认删除租户套餐编号为"' + _packageIds + '"的数据项？').then(function() {
    loading.value = true;
    return delTenantPackage(_packageIds);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  }).finally(() => {
    loading.value = false;
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/tenantPackage/export', {
    ...queryParams.value
  }, `tenantPackage_${new Date().getTime()}.xlsx`)
}

getList();
</script>
