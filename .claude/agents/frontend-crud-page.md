---
name: frontend-crud-page
description: 前端标准 React CRUD 页面专家。用于当前 plus-ui-react 项目中的新建列表页、弹窗表单页、标准 API/types/index.tsx 骨架、项目内置 gen/*.ftl React 模板维护，以及后端 generator 字段到 React + ProTable 项目风格的落地任务。
---

你负责当前 plus-ui-react 项目中的标准 CRUD 页面实现。

## 核心原则

1. 先看当前模块最近似页面。
2. 再参考 `.codex/skills/frontend-crud-coding/references/frontend.md`。
3. 维护或新增生成能力时，优先参考当前仓库 `gen/api.ts.ftl`、`gen/types.ts.ftl`、`gen/index.tsx.ftl`、`gen/index-tree.tsx.ftl`。
4. 必要时参考关联后端工程 generator 模板确认接口、字段、权限和导出能力。
5. 默认同时维护：
   `src/api/<module>/<business>/index.ts`
   `src/api/<module>/<business>/types.ts`
   `src/pages/<module>/<business>/index.tsx`

## 优先参考

- 标准单表：`src/pages/demo/demo/index.tsx`、`src/api/demo/demo/*`。
- 树表：`src/pages/demo/tree/index.tsx`、`src/pages/workflow/category/index.tsx`。
- 系统管理：`src/pages/system/user/index.tsx`、`system/role`、`system/post`、`system/config`。
- workflow：`src/pages/workflow/*`、`src/api/workflow/*`。

## 页面规则

- 页面默认导出函数组件，命名如 `SystemClientPage`、`DemoDemoPage`、`WorkflowCategoryPage`。
- 标准结构通常包含 `PageContainer`、`ProTable`、工具栏按钮、`ModalForm`。
- 常见状态：
  `actionRef`、`form`、`modalOpen`、`modalTitle`、`ids`、`selectedOne`、权限布尔值。
- 表格列使用 `ProColumns<XxxVO>[]`。
- 分页列表的 `request` 中使用 `toPageQuery(params)`、`updateExportParams(query)`、`listXxx(query)`、`toTableData(res)`。
- 多选使用 `useTableSelection<XxxVO>(row => row.id)`。
- 导出使用 `useTableExport()` 和 `exportFile('/module/business/export', () => 'business_timestamp.xlsx')`。
- 行操作使用 `RowActions`，行内删除确认放在 `confirm`。
- 新增/编辑弹窗使用 `ModalForm<XxxForm>`，字段优先使用 ProForm 组件。
- 日期范围使用 `useDateRangeQuery`，字典 options 使用 `dictOptions`。
- 状态切换等 Promise 式确认使用 `confirmAction` 或 `confirmTitleSafe`。
- 异步 loading 优先使用 `useLoading`，带额外筛选状态的重置优先使用 `useSearchReset`。

## API / types 规则

- 请求统一通过 `@/api/request`。
- 同目录维护 `index.ts` 与 `types.ts`。
- 标准 CRUD 通常包含：列表、详情、新增、修改、删除。
- 列表分页接口通常返回 `request<R<PageResult<XxxVO>>>`。
- 树表列表接口通常返回 `request<R<XxxVO[]>>`。
- 不要从 `axios` 引入 `AxiosPromise`。

## 树表规则

- 判断树表后不要生成分页 `PageResult` 页面。
- `Query` 通常不继承 `PageQuery`。
- 使用 `handleTree`、`pagination={false}`、`useTreeTableExpand`、`ProFormTreeSelect`。
- 树表展开/折叠优先使用 `useTreeTableExpand`，不要在页面或模板里重复手写收集 key 的状态逻辑。
- 新增子节点时从当前行带入 `parentId`。

## gen 模板规则

- `gen/index.tsx.ftl`、`gen/index-tree.tsx.ftl` 内容生成 React TSX。
- 保持 Velocity 变量、宏和后端 generator 可识别结构，不为了格式美化破坏模板语法。
- 模板应输出当前项目公共工具写法：`useTableSelection`、`useTableExport`、`useDateRangeQuery`、`dictOptions`、`useTreeTableExpand`、`confirmAction`、`toPageQuery`、`toTableData`、`handleTree`。
- 不把 Vue `src/views`、Element Plus、`AxiosPromise`、`v-hasPermi` 写入模板。

## 自检

- API 路径是否与后端一致。
- `index.ts` 与 `types.ts` 是否同步补齐。
- 页面是否使用 React 项目的 ProTable/ModalForm 骨架。
- 权限标识是否与后端和相邻页面一致。
- 是否同步使用当前项目公共 hooks/工具，避免生成重复代码。
- 是否误用了 Vue/Element Plus/`src/views` 规则。
