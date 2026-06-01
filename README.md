# RuoYi-React-Plus

## 平台简介

- 本仓库为前端技术栈 [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Ant Design](https://ant.design/) + [Umi Max](https://umijs.org/) + [Vite](https://vitejs.dev/)。
- 官方项目: 基于 Vue + ElementPlus 版本前端项目 [plus-ui](https://gitee.com/JavaLionLi/plus-ui)
- 成员项目: 基于 vben5(ant-design-vue) 的前端项目 [ruoyi-plus-vben5](https://gitee.com/dapppp/ruoyi-plus-vben5)
- 成员项目: 基于soybean 的前端项目 [ruoyi-plus-soybean](https://gitee.com/xlsea/ruoyi-plus-soybean)

## 配套后端代码仓库地址

| 介绍           | 项目名           | 项目地址                                                                                                                                                              |
| -------------- | :--------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 分布式集群框架 | RuoYi-Vue-Plus   | [Gitee](https://gitee.com/dromara/RuoYi-Vue-Plus) / [GitHub](https://github.com/dromara/RuoYi-Vue-Plus) / [GitCode](https://gitcode.com/dromara/RuoYi-Vue-Plus)       |
| 微服务框架     | RuoYi-Cloud-Plus | [Gitee](https://gitee.com/dromara/RuoYi-Cloud-Plus) / [GitHub](https://github.com/dromara/RuoYi-Cloud-Plus) / [GitCode](https://gitcode.com/dromara/RuoYi-Cloud-Plus) |

## 分支说明

- 6.X-react分支(稳定发布主分支 生产可用)
- dev-react分支(开发分支 开发过程中使用)

## 前端运行

```bash
# 安装依赖
pnpm install --registry=https://registry.npmmirror.com

# 启动服务
pnpm dev

# 构建生产环境
pnpm build:prod

# 前端访问地址 http://localhost:8000
```

## 本框架与RuoYi的业务差异

| 业务         | 功能说明                                                      | 本框架 | RuoYi                         |
| ------------ | ------------------------------------------------------------- | ------ | ----------------------------- |
| 用户管理     | 用户的管理配置 如:新增用户、分配用户所属部门、角色、岗位等    | 支持   | 支持                          |
| 部门管理     | 配置系统组织机构（公司、部门、小组） 树结构展现支持数据权限   | 支持   | 支持                          |
| 岗位管理     | 配置系统用户所属担任职务                                      | 支持   | 支持                          |
| 菜单管理     | 配置系统菜单、操作权限、按钮权限标识等                        | 支持   | 支持                          |
| 角色管理     | 角色菜单权限分配、设置角色按机构进行数据范围权限划分          | 支持   | 支持                          |
| 字典管理     | 对系统中经常使用的一些较为固定的数据进行维护                  | 支持   | 支持                          |
| 参数管理     | 对系统动态配置常用参数                                        | 支持   | 支持                          |
| 通知公告     | 系统通知公告信息发布维护                                      | 支持   | 支持                          |
| 操作日志     | 系统正常操作日志记录和查询 系统异常信息日志记录和查询         | 支持   | 支持                          |
| 登录日志     | 系统登录日志记录查询包含登录异常                              | 支持   | 支持                          |
| 文件管理     | 系统文件展示、上传、下载、删除等管理                          | 支持   | 无                            |
| 文件配置管理 | 系统文件上传、下载所需要的配置信息动态添加、修改、删除等管理  | 支持   | 无                            |
| 在线用户管理 | 已登录系统的在线用户信息监控与强制踢出操作                    | 支持   | 支持                          |
| 定时任务     | 运行报表、任务管理(添加、修改、删除)、日志管理、执行器管理等  | 支持   | 仅支持任务与日志管理          |
| 代码生成     | 多数据源前后端代码的生成（java、html、xml、sql）支持CRUD下载  | 支持   | 仅支持单数据源                |
| 系统接口     | 根据业务代码自动生成相关的api接口文档                         | 支持   | 支持                          |
| 服务监控     | 监视集群系统CPU、内存、磁盘、堆栈、在线日志、Spring相关配置等 | 支持   | 仅支持单机CPU、内存、磁盘监控 |
| 缓存监控     | 对系统的缓存信息查询，命令统计等。                            | 支持   | 支持                          |
| 在线构建器   | 拖动表单元素生成相应的HTML代码。                              | 支持   | 支持                          |
| 使用案例     | 系统的一些功能案例                                            | 支持   | 不支持                        |

## 演示图例

|                                                                                            |                                                                                            |
|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| ![输入图片说明](https://foruda.gitee.com/images/1780300015922774817/47c1f39f_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300034170229441/1608ee0a_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300053860691133/f8d334ce_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300066022559831/7c8e74cd_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300081538003511/906c028f_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300104233264980/8df4a03d_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300116889441614/7206e749_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300133555040293/6f4067f0_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300380395316233/d1cc70c4_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300232306768234/1f474295_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300245151922243/132ae6e0_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300259301543383/a0c982b3_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300401947949756/673c7fdc_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300417037474904/2fd89565_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300430575382678/cef384a4_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300446747725208/413ba289_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300471231552129/5d45227c_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300496559910468/0008fa0c_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300562713799535/a15b018d_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300575582711290/d440b1c9_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300617515185769/db2968e4_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300631462725775/30b9cd2c_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300644824617448/12b7e446_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300665964630901/07f14841_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780300695487754948/17569a2e_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780300715114472355/ebb81e7c_1766278.png "屏幕截图") |
