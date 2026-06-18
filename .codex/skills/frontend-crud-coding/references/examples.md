# 使用案例

## 案例 1：新增标准 CRUD 页面

### 用户提问示例

```text
使用 $frontend-crud-coding 为 system/client 补一套 React 前端 CRUD 页面。
后端接口已经有 /system/client/list、/system/client/{id}、POST /system/client、PUT /system/client、DELETE /system/client/{ids}。
请参考 src/pages/demo/demo/index.tsx 和现有 system/client 风格实现。
```

### 期望执行方式

- 先看 `src/api/system/client/*` 和 `src/pages/system/client/index.tsx` 是否已存在。
- 再看 `src/pages/demo/demo/index.tsx` 的标准 React CRUD 骨架。
- 新增标准生成能力时优先对照当前仓库 `gen/index.tsx.ftl`、`gen/api.ts.ftl`、`gen/types.ts.ftl`；boot4 generator 只用于核对字段、权限和接口。
- 生成或修改 `api/index.ts`、`types.ts`、`pages/.../index.tsx`。
- 使用 `request<R<PageResult<T>>>`、`ProTable`、`ModalForm`、`RowActions`、`useTableSelection`、`useTableExport`。
- 日期范围、字典 options、确认框、loading 等优先使用 `useDateRangeQuery`、`dictOptions`、`confirmAction`、`useLoading` 等项目工具。

## 案例 2：新增树表页面

### 用户提问示例

```text
使用 $frontend-crud-coding 为 demo/tree2 新增树表 CRUD，接口返回数组，字段包含 id、parentId、name、orderNum。
参考 src/pages/demo/tree/index.tsx 和 workflow/category。
```

### 期望执行方式

- 判断这是树表，不生成分页 `PageResult` 页面。
- API 列表返回 `R<Tree2VO[]>`。
- `Query` 不继承 `PageQuery`。
- 页面使用 `handleTree`、`pagination={false}`、`useTreeTableExpand`、`ProFormTreeSelect`。
- 新增子节点时从当前行带入 `parentId`。

## 案例 2.1：优化 React 代码生成模板

### 用户提问示例

```text
使用 $frontend-crud-coding 优化当前项目 gen 目录下的 React 代码生成模板，让生成页面继续使用新加的工具。
```

### 期望执行方式

- 读取 `gen/api.ts.ftl`、`gen/types.ts.ftl`、`gen/index.tsx.ftl`、`gen/index-tree.tsx.ftl`。
- 保持 FreeMarker 变量、宏和文件名不变。
- 普通表模板继续使用 `useTableSelection`、`useTableExport`、`useDateRangeQuery`、`dictOptions`、`confirmAction`。
- 树表模板继续使用 `handleTree`、`filterTree`、`useTreeTableExpand`、`dictOptions`。
- 输出仍是 React TSX 项目代码，不写 Vue `src/views`、Element Plus 或 `AxiosPromise`。

## 案例 3：修改已有复杂列表页

### 用户提问示例

```text
使用 $frontend-crud-coding 修改 system/user 页面：
1. 新增一个创建时间快捷筛选
2. 导出按钮保留在工具栏中
3. 保持现有树筛选、导入、详情抽屉和角色分配不变
```

### 期望执行方式

- 判断这是“已有复杂页面增强”，不是重新生成 CRUD。
- 优先阅读 `src/pages/system/user/index.tsx` 和相关子组件。
- 保留 `TreePanel`、导入弹窗、`UserDetailDrawer`、角色分配路由、权限控制。
- 只增量修改搜索和查询参数处理。

## 案例 4：修改 workflow 页面

### 用户提问示例

```text
使用 $frontend-crud-coding 为 workflow/category 增加状态筛选和导出按钮，保持 workflow 模块自己的树表风格。
```

### 期望执行方式

- 优先看 `src/pages/workflow/category/index.tsx` 和 `src/api/workflow/category/*`。
- 判断是否需要后端新增导出接口；前端导出路径保持 `/workflow/category/export`。
- 不迁移 system/user 的用户专属逻辑。
- 保留树表、`useTreeTableExpand`、`handleTree` 和分类弹窗逻辑。

## 案例 5：只补 API 和 types

### 用户提问示例

```text
使用 $frontend-crud-coding 为 monitor/cache 补全前端 API 和 types，页面先不改。
```

### 期望执行方式

- 只维护 `src/api/monitor/cache/index.ts` 和 `src/api/monitor/cache/types.ts`。
- 仍然检查同目录 monitor API 的命名、返回结构和导出风格。
- 返回类型使用 `R<T>` 和 `PageResult<T>` from `@/api/types`。
- 不创建页面，不改路由。

## 案例 6：接入后端新增状态切换接口

### 用户提问示例

```text
使用 $frontend-crud-coding 给 system/client 页面接入 PUT /system/client/changeStatus，状态字段 status，参考 system/user。
```

### 期望执行方式

- API 增加 `changeClientStatus(id, status)`。
- types 确认 `status` 类型是 string、number 还是 boolean。
- 表格列用 Ant Design `Switch`，checked 值跟后端字段类型一致。
- 切换失败时回滚原状态或刷新列表。
- 权限使用 `system:client:edit` 或后端实际权限。

## 推荐的高质量任务描述

```text
使用 $frontend-crud-coding 在当前 React 前端项目中增强 `/system/notice` 列表页：
1. 保留现有页面
2. 新增状态筛选和导出
3. API 路径沿用后端接口
4. 参考 system/config 的工具栏与导出交互
5. 参考当前项目 gen 模板和 boot4 generator 字段补齐缺失 types
```

## 不推荐的任务描述

```text
帮我写个后台页面
```

更好的写法至少补充：

- 模块名
- 业务名
- 后端接口前缀
- 是新增还是修改
- 是否需要分页、导出、树表、字典、权限
- 想参考哪个现有页面
