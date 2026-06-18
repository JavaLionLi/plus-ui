# 前端约定

## 优先参考的代码来源

- 当前目标目录下最近似页面、API、types。
- 当前仓库内置 React 生成模板：`gen/api.ts.ftl`、`gen/types.ts.ftl`、`gen/index.tsx.ftl`、`gen/index-tree.tsx.ftl`。
- 标准单表：`src/pages/demo/demo/index.tsx`、`src/api/demo/demo/index.ts`、`src/api/demo/demo/types.ts`。
- 树表：`src/pages/demo/tree/index.tsx`、`src/pages/workflow/category/index.tsx`。
- 复杂系统页：`src/pages/system/user/index.tsx`、`src/pages/system/role/index.tsx`、`src/pages/system/post/index.tsx`、`src/pages/system/config/index.tsx`。
- workflow 页：`src/pages/workflow/*`、`src/api/workflow/*`。
- 监控页：`src/pages/monitor/*`、`src/api/monitor/*`。
- 公共 hooks：`src/hooks/useTableSelection.ts`、`src/hooks/useTableExport.ts`、`src/hooks/useDict.ts`、`src/hooks/useDateRangeQuery.ts`、`src/hooks/useTreeTableExpand.ts`、`src/hooks/useLoading.ts`、`src/hooks/useSearchReset.ts`。
- 公共组件：`src/components/common/RowActions.tsx`、`TreePanel.tsx`、`RightToolbar.tsx`、`DictTag.tsx`、上传/预览组件。
- 工具函数：`src/utils/ruoyi.ts`、`src/utils/permission.ts`、`src/utils/download.ts`、`src/utils/dict.ts`、`src/utils/modal.ts`。

## 基础栈与格式

- 技术栈是 React + TypeScript + Umi Max + Ant Design + ProComponents + ahooks + Zustand + TanStack Query。
- 包管理按仓库现状使用 pnpm。
- `.editorconfig` 要求 UTF-8、2 空格缩进。
- 当前仓库没有 Prettier；格式化使用 `pnpm run fmt`，lint 使用 `pnpm lint`。
- 不要在一个页面里混入与仓库不一致的格式和写法。

## API 文件规则

- 标准 API 文件放在 `src/api/<module>/<business>/index.ts`，同目录维护 `types.ts`。
- import 顺序优先跟随附近文件，标准形式：
  `import type { PageResult, R } from '@/api/types';`
  `import request from '@/api/request';`
  `import type { XxxForm, XxxQuery, XxxVO } from './types';`
- 不要从 `axios` 引入 `AxiosPromise`；当前 `request<T>()` 返回 `Promise<T>`，接口函数通常返回 `Promise<R<T>>`。
- 列表分页接口通常返回 `request<R<PageResult<XxxVO>>>({ url, method: 'get', params: query })`。
- 树表列表接口通常返回 `request<R<XxxVO[]>>({ url, method: 'get', params: query })`。
- 详情接口返回 `R<XxxVO>`；复杂详情返回单独的 `InfoVO`。
- 标准函数命名：
  `listXxx` -> `GET /<module>/<business>/list`
  `getXxx` -> `GET /<module>/<business>/{id}`
  `addXxx` -> `POST /<module>/<business>`
  `updateXxx` -> `PUT /<module>/<business>`
  `delXxx` -> `DELETE /<module>/<business>/{id or ids}`
  `changeXxxStatus` -> `PUT /<module>/<business>/changeStatus`
- query string 用 `params`，请求体用 `data`。
- 加密、防重复提交等 headers 直接写在请求配置里，例如用户重置密码中的 `isEncrypt`、`repeatSubmit`。
- 当前仓库多数 API 使用 `export function`；新增标准 CRUD 优先跟随相邻模块。
- 只有相邻模块已有聚合对象时才新增默认导出。

## 类型文件规则

- 标准类型定义 `VO`、`Form`、`Query`，必要时补 `InfoVO`、`TreeVO`、`ResetPwdForm` 等扩展类型。
- `Form` 通常继承 `BaseEntity`。
- 非树表 `Query` 通常继承 `PageQuery`。
- 树表 `Query` 通常不继承 `PageQuery`。
- ID 字段通常使用 `string | number`，批量删除参数使用 `string | number | Array<string | number>`。
- Java 数值类型映射为 `number`，Boolean 映射为 `boolean`，日期/文本默认 `string`。
- 日期范围查询保留 `params?: Record<string, unknown>` 或跟随相邻页面现有类型，不要因为它看起来宽松就删掉。
- 列表对象、表单对象、查询对象职责分开；字段不一致时不要强行复用一个接口。
- 能明确写出类型时不要用 `any`；组件库、字典或历史接口确实无法收窄时再保留。

## React 页面结构规则

- 页面默认导出函数组件，命名如 `SystemUserPage`、`DemoDemoPage`、`WorkflowCategoryPage`。
- 标准页使用 `PageContainer` 包裹 `ProTable` 和 `ModalForm`。
- 标准列表页常见状态：
  `actionRef`、`form`、`modalOpen`、`modalTitle`、`ids`、`selectedOne`、权限布尔值。
- 弹窗状态优先使用 `useBoolean(false)`，表单用 `Form.useForm<XxxForm>()`。
- ProTable 使用：
  `rowKey`
  `columns`
  `search={{ labelWidth: 90 }}`
  `pagination={{ defaultPageSize: 10, showSizeChanger: true }}`
  `request={async params => { ... }}`
  `toolBarRender={() => [...]}`
- 分页查询使用 `toPageQuery(params)`，然后 `updateExportParams(query)`，最后 `return toTableData(res)`。
- 表格列类型使用 `ProColumns<XxxVO>[]`。
- 新增/编辑弹窗使用 `ModalForm<XxxForm>`，字段优先使用 `ProFormText`、`ProFormDigit`、`ProFormSelect`、`ProFormTreeSelect`、`ProFormDateTimeRangePicker` 等 ProForm 组件。
- ModalForm 成功提交后返回 `true`，并刷新 `actionRef.current?.reload()`。

## 页面行为规则

- `openAdd` 负责 `form.resetFields()`、设置默认值、设置标题、打开弹窗。
- `openEdit` 先按行或 `selectedOne` 找目标，再查详情，`form.resetFields()`，`form.setFieldsValue(res.data)`，最后打开弹窗。
- `submitForm` 根据主键判断新增或修改，成功后 `message.success('操作成功')`、重置表单、刷新列表。
- `remove` 或 `handleDelete` 支持行删除和批量删除，成功后 `message.success('删除成功')`、`clearSelection()`、`reloadAndRest` 或 `reload`。
- 批量按钮通常用 `Popconfirm`，行操作确认优先放在 `RowActions` 的 `confirm`。
- 状态切换失败时要回滚或刷新，参考 `src/pages/system/user/index.tsx`。
- 日期范围查询优先使用 `useDateRangeQuery`，底层通过 `addDateRange` 写入 `params.beginXxx/endXxx`。
- 字典 options 优先使用 `dictOptions(dicts.xxx)`。
- 导入上传参考 `system/user/components/UserImportModal.tsx` 或流程定义导入弹窗，保留 `globalHeaders()` 和 `appEnv.baseApi` 相关方式。

## 字典、权限与公共工具

- 字典使用 `const dicts = useDict('sys_normal_disable', 'sys_user_gender')`。
- 字典 options 使用 `dictOptions` from `@/utils/dict` 映射为 `{ label, value }`。
- 权限使用：
  `const userInfo = useUserStore(state => state.userInfo);`
  `const canAdd = hasPermi(userInfo, ['system:user:add']);`
- 不要使用 Vue 权限指令 `v-hasPermi`。
- 常用工具：
  `hasPermi` from `@/utils/permission`
  `handleTree`、`parseStrEmpty`、`toPageQuery`、`toTableData`、`addDateRange`、`formatDateTimeRange` from `@/utils/ruoyi`
  `dictOptions` from `@/utils/dict`
  `confirmAction`、`confirmTitleSafe` from `@/utils/modal`
  `download` via `useTableExport`

## 组件与样式规则

- 行操作优先复用 `RowActions`，并使用 `@ant-design/icons` 图标。
- 树筛选优先复用 `TreePanel`，参考 `system/user`。
- 导出优先复用 `useTableExport`。
- 多选优先复用 `useTableSelection`。
- 异步 loading 优先复用 `useLoading`，不要重复手写 `setLoading(true)` + `finally setLoading(false)`。
- ProTable 重置后还要清空额外筛选状态时，优先复用 `useSearchReset`。
- Promise 式确认框优先复用 `confirmAction` 或 `confirmTitleSafe`。
- 标准页面尽量使用 `PageContainer`、`ProTable`、ProComponents 页面壳，不堆大量内联样式。
- 需要自定义布局时先查 `src/assets/styles` 是否已有 `.tree-table-page`、`.table-panel`、`.page-surface` 等类。
- 不要为了单页需求修改全局组件样式。

## 树表规则

- 树表列表接口通常返回数组，页面通过 `handleTree<T>(res.data || [], 'id', 'parentId')` 组树。
- `ProTable` 使用 `pagination={false}`。
- 使用 `useTreeTableExpand` 控制 `expandedRowKeys`、`onExpandedRowsChange`、`syncExpandedRows`、`toggleExpandAll`。
- 展开/折叠按钮参考 `demo/tree` 和 `workflow/category`，用 `SortAscendingOutlined`。
- 表单中上级节点使用 `ProFormTreeSelect`。
- 新增子节点时从当前行回填 `parentId`。
- 删除确认文案优先使用业务名称，而不是批量 ID 文案。

## 与 gen 模板、Vue 参考项目和后端生成器的关系

- 当前仓库 `gen/*.ftl` 是 React 版内置代码生成模板，是维护生成能力时的第一参考。
- `gen/index.tsx.ftl`、`gen/index-tree.tsx.ftl` 内容必须生成 React TSX 页面。
- 修改公共 hooks/工具后，如果它们能简化标准生成页，要同步评估 `gen/*.ftl` 是否需要更新。
- Vue skill 和 `.claude/agents` 提供的是任务分型、优先级、增量修改、自检方式，不是 React 实现模板。
- boot4 后端 generator 模板可用于确认字段、权限、导出、状态切换、排序、日期范围等，但不是最终答案。
- 当前 React 项目的核心骨架是 `ProTable`、`ModalForm`、`RowActions`、`useTableSelection`、`useTableExport`。
- 修改已有页面时，不要把现有强业务逻辑替换回 generator 的简化逻辑。

## 验证规则

- 只改文档、skill 或 `gen/*.ftl` 模板：至少运行 skill 基础校验或 `git diff --check`；如果模板改动依赖项目工具，优先再跑 `pnpm lint`。
- 改前端 TS/TSX/API/types：优先运行 `pnpm exec tsc --noEmit` 或 `pnpm lint`。
- 改页面、import、权限或较多文件：运行 `pnpm lint`。
- 改公共 hooks、组件、构建相关或大范围页面：再运行 `pnpm build`。
- 如果验证因为环境、依赖或权限失败，交付时说明失败命令和原因。

## 避免事项

- 不要从 `axios` 引入 `AxiosPromise`。
- 不要绕开 `@/api/request` 或 `useTableExport` 自造请求/下载封装。
- 不要跳过 `types.ts`，把类型全写在页面里。
- 不要把 `src/pages` 写成 Vue 项目的 `src/views`。
- 不要使用 Vue 的 `ref`、`reactive`、`toRefs`、`v-hasPermi`、Element Plus 组件或 SCSS 页面壳。
- 不要删除日期范围 `params`、权限判断、导出、导入、树筛选、列显隐等现有能力。
- 不要为了“更整洁”重写复杂页面的大块业务逻辑。
