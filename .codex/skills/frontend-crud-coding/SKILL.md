---
name: frontend-crud-coding
description: 在当前 plus-ui-react 前端项目中按真实 React + TypeScript + Umi Max + Ant Design ProComponents + oxlint/oxfmt 代码风格生成或修改页面、API、types、hooks 接入和样式。用于新增或修改标准 CRUD 列表页、树表页、系统管理页、监控页、workflow 页面、demo 页面，补齐与 RuoYi-Vue-Plus boot4 后端接口对应的 src/api、types 和 src/pages 代码；触发后应先读取适用 references，再阅读目标模块真实代码和必要的 Vue 参考 skill/后端 generator 模板。
---

# 前端编码规范

先对齐当前 React 项目里的真实实现，再参考 Vue 版本 skill 和关联后端工程的代码生成器模板。不要直接套 Vue 3、Element Plus、AxiosPromise 或 `src/views` 规则；要落成当前仓库的 `src/pages`、`src/api`、ProTable、ModalForm、权限和导出方式。

## 执行流程

1. 判断任务类型：新增标准 CRUD、树表、已有页面增强、复杂业务页、只补 API/types。
2. 按“文档读取规则”读取必要 reference，不一次性展开所有资料。
3. 阅读目标目录下最近似的真实代码：
   - 标准单表优先看 `src/pages/demo/demo/index.tsx`、`src/api/demo/demo/*`。
   - 树表优先看 `src/pages/demo/tree/index.tsx`、`src/pages/workflow/category/index.tsx`。
   - 系统复杂页优先看 `src/pages/system/user/index.tsx`、`system/role`、`system/post`、`system/config`。
   - workflow 业务页优先看 `src/pages/workflow/*` 与 `src/api/workflow/*` 同类页面。
4. 需要从 Vue 版本迁移经验时，参考 `D:\git-sources\Plus相关\plus-ui-new\.codex\skills\frontend-crud-coding` 和 `.claude\agents`，只吸收任务分型、增量修改和自检原则。
5. 新增标准页面前，可以对照后端工程 `D:\git-sources\Plus相关\RuoYi-Vue-Plus-boot4\ruoyi-modules\ruoyi-gen\src\main\resources\vm` 确认接口、字段、权限和导出能力，但输出必须改成 React 项目风格。
6. 新增代码时通常同步维护 `src/api/<module>/<business>/index.ts`、`types.ts`、`src/pages/<module>/<business>/index.tsx`。
7. 增强已有页面时只做增量修改，保留原页面的树筛选、导入导出、列显隐、权限、字典、弹窗、抽屉和路由跳转能力。
8. 修改完成后按影响范围运行验证：优先 `pnpm exec tsc --noEmit` 或 `pnpm lint`；大范围页面、公共组件、构建配置变更再跑 `pnpm build`。

## 文档读取规则

- 前端 API、types、页面、hooks、样式、权限、导出和验证规则，先读 [references/frontend.md](references/frontend.md)。
- 不确定任务边界、需要标准用例或提问方式时，再读 [references/examples.md](references/examples.md)。
- reference 只约束实现方式和自检范围；发生冲突时，以当前模块真实代码和实际调用点为准。

## 优先级规则

发生冲突时按下面顺序决策：

1. 目标目录下最近似页面、API、types 的真实实现。
2. 当前项目公共 hooks、组件、工具、样式和请求封装约定。
3. Vue 参考项目 `.codex` / `.claude` 中的任务分型和工作流。
4. 关联后端工程 generator 模板。
5. 通用 React / Ant Design ProComponents 习惯。

也就是说：

- 同模块已有页面怎么写，优先怎么写。
- 没有现成页面时，使用 demo 页面作为骨架，再按后端接口字段和权限补齐。
- 复杂模块不能为了“标准 CRUD”退化成裸模板页。
- Vue 版本只作为迁移参考，不复制 Vue 组件、hooks、指令、样式类和类型导入。

## 仓库通用规则

- 遵循 `.editorconfig` 和仓库现状：UTF-8、2 空格缩进、TypeScript、TSX。
- 包管理使用 `pnpm`；格式脚本是 `pnpm run fmt`，lint 脚本是 `pnpm lint`。
- 技术栈是 React 19 + TypeScript + Umi Max + Ant Design 6 + Ant Design ProComponents + ahooks + TanStack Query + Zustand。
- 页面放在 `src/pages`，不是 Vue 项目的 `src/views`。
- 请求统一通过 `src/api/request.ts`，API 返回类型使用 `Promise<R<T>>`，不要从 `axios` 或 Vue 项目引入 `AxiosPromise`。
- 分页结果使用 `PageResult<T>` from `@/api/types`，接口外层使用 `R<T>` from `@/api/types`。
- 标准列表页优先复用 `ProTable`、`ModalForm`、`RowActions`、`useTableSelection`、`useTableExport`、`toPageQuery`、`toTableData`。
- 权限用 `const userInfo = useUserStore(state => state.userInfo)` 和 `hasPermi(userInfo, ['module:business:action'])` 计算布尔值。
- 新页面不要无故引入另一套状态管理、请求封装、表格封装、样式体系或权限写法。

## 目录映射规则

通常按下面关系组织代码：

- 后端 `/system/user/*` 对应 `src/api/system/user/*` 与 `src/pages/system/user/*`
- 后端 `/monitor/xxx/*` 对应 `src/api/monitor/xxx/*` 与 `src/pages/monitor/xxx/*`
- 后端 `/workflow/xxx/*` 对应 `src/api/workflow/xxx/*` 与 `src/pages/workflow/xxx/*`
- 后端 `/demo/xxx/*` 对应 `src/api/demo/xxx/*` 与 `src/pages/demo/xxx/*`

标准新增通常至少包含：

- `src/api/<module>/<business>/index.ts`
- `src/api/<module>/<business>/types.ts`
- `src/pages/<module>/<business>/index.tsx`

按业务复杂度，可能继续补：

- 导入弹窗
- 详情抽屉或详情页
- 树筛选面板
- 列显隐配置
- 分配/授权子页面
- 自定义 Less 样式

## 任务分型

### 1. 标准单表 CRUD

以 `src/pages/demo/demo/index.tsx` 和 `src/api/demo/demo/*` 为主要起点，补齐列表、搜索、分页、新增、编辑、删除、导出、权限、类型和验证。

### 2. 树表 CRUD

以 `src/pages/demo/tree/index.tsx`、`src/pages/workflow/category/index.tsx` 为主要起点。列表接口通常返回数组，不使用分页 `PageResult`；页面使用 `handleTree`、`expandedRowKeys`、`ProFormTreeSelect`。

### 3. 强业务页面

如果页面包含树筛选、导入导出、更多菜单、状态切换、角色分配、详情抽屉、复杂校验、联动选择或独立路由，优先增量修改现有页面。不要重写成简单 CRUD。

### 4. 工作流页面

workflow 目录优先参考 `src/pages/workflow/*`。流程定义、流程实例、任务列表、请假申请等页面通常有业务按钮、弹窗和路由跳转，不要硬套 system 模块。

### 5. 只补 API 和 types

只维护 `src/api/<module>/<business>/index.ts` 与 `types.ts`，但仍要与后端路由、返回结构、当前模块导入方式和类型入口一致。

## 输出要求

使用本 skill 时，默认期望产出应满足：

- 类型完整，不把页面逻辑大量写成 `any`。
- API 路径、函数名、权限标识与后端接口保持一致。
- 标准页查询、重置、分页、弹窗、提交、删除、导出流程闭环完整。
- 复杂页面保留原有交互能力和业务约束。
- 代码体现当前项目 hooks、页面壳和下载方式，而不是 Vue 版本或 generator 裸输出。
- 交付前说明运行过的验证命令；如果无法验证，说明原因。

## 快速检查清单

- API 是否从 `@/api/request` 引入 `request`。
- `R`、`PageResult`、`PageQuery`、`BaseEntity` 是否来自 `@/api/types`。
- API `params` 和 `data` 是否与后端方法一致。
- 分页表格 request 是否通过 `toPageQuery(params)` 和 `toTableData(res)`。
- 导出是否通过 `useTableExport` 和 `exportFile('/module/business/export', () => 'name_timestamp.xlsx')`。
- 多选是否通过 `useTableSelection<T>(row => row.id)`。
- 行操作是否优先使用 `RowActions` 和 Ant Design 图标。
- 权限是否通过 `useUserStore` + `hasPermi` 计算，不要写 Vue 指令。
- 日期范围是否通过 `formatDateTimeRange` + `addDateRange` 或附近页面现有方式处理。
- 树表是否使用 `handleTree`、`pagination={false}`、`expandedRowKeys`、`ProFormTreeSelect`。

## 推荐提问方式

推荐把请求描述到下面粒度：

- 目标模块和业务名
- 后端接口前缀
- 是新增页面、修改页面，还是只补 API/types
- 是否需要导入、导出、树筛选、树表、状态切换、字典、权限按钮
- 希望参考哪个现有页面

例如：

- 使用 `$frontend-crud-coding` 为 `/system/client` 补一套 React 标准 CRUD 页面，参考 `demo/demo`、现有 `system/client` 和 boot4 generator 模板。
- 使用 `$frontend-crud-coding` 修改 `workflow/category` 列表页，增加导出按钮和状态筛选，保持当前 workflow 树表风格。
