---
name: frontend-page-enhancement
description: 复杂前端页面增强专家。用于修改当前 plus-ui-react 项目中已经存在的列表页、树筛选页、带导入导出、详情抽屉、更多操作和状态切换的页面，强调增量修改和保留现有交互能力。
---

你负责当前 plus-ui-react 项目中已有页面的增强，不是重写页面。

## 核心原则

1. 优先阅读当前页面完整实现和相关子组件。
2. 增量修改，不重写整页。
3. 保留已有树筛选、导入导出、列显隐、详情抽屉、更多操作、状态切换、路由跳转、权限控制和样式壳。
4. 不要把复杂页面退化成 demo/generator 式基础列表页。
5. 修改前先看 `.codex/skills/frontend-crud-coding/references/frontend.md` 中对应规则。

## 常见任务

- 调整工具栏按钮和行操作。
- 增加筛选条件和日期范围。
- 增加导入、导出能力。
- 增加状态切换、快捷操作、确认弹窗。
- 增加详情抽屉或增强现有抽屉。
- 补复杂页面的小型子功能。
- 接入新 API 并保持现有页面状态流。

## React 项目约定

- 表格页通常使用 `PageContainer` + `ProTable`。
- 复杂系统页可包含 `TreePanel`、子组件弹窗、抽屉、授权路由跳转。
- 权限通过 `useUserStore` + `hasPermi` 计算，不使用 Vue 指令。
- 字典通过 `useDict` 加载，按现有页面映射为 Ant Design options。
- 字典 options 优先使用 `dictOptions` from `@/utils/dict`。
- 导出通过 `useTableExport`，不要另写下载封装。
- 多选通过 `useTableSelection`，不要手写一套重复状态。
- 日期范围优先使用 `useDateRangeQuery`，底层保持 `addDateRange` 参数格式。
- 树表展开优先使用 `useTreeTableExpand`。
- 异步 loading 优先使用 `useLoading`。
- 额外筛选状态的重置优先使用 `useSearchReset`。
- Promise 式确认框优先使用 `confirmAction` 或 `confirmTitleSafe`。
- 状态切换失败时回滚或刷新，参考 `system/user`。

## 增量修改规则

- 如果页面已有子组件，如 `UserFormModal`、`UserImportModal`、`UserDetailDrawer`，优先修改或复用子组件，不把所有逻辑堆回主页面。
- 如果页面已有权限布尔值，沿用同一命名风格补新权限。
- 如果页面已有导出参数缓存，继续通过 `updateExportParams` 更新。
- 如果页面已有树筛选状态，查询参数要合并该状态，不要覆盖掉。
- 如果页面已有特殊禁用规则、超级管理员保护或业务状态判断，必须保留。
- 如果增强的是标准 CRUD 能力或公共工具约定，要评估当前仓库 `gen/*.ftl` 是否也应同步更新。

## 自检

- 是否破坏了原页面结构和样式。
- 是否误删了已有权限控制或交互能力。
- 是否保留了树筛选、导入导出、抽屉、路由跳转等复杂能力。
- 是否应该拆成子组件而不是继续堆主页面。
- 是否使用了当前项目已有工具，避免重复手写日期范围、字典 options、树展开、loading、确认框。
- 是否误用了 Vue/Element Plus/generator 的简化逻辑。
