# agent_flow_tools

> **面向大型 AI Agent 项目的"任务图"工具：把项目说明递归拆成原子节点，每个节点都能导出一份给 Agent 看的任务单 + 服务接口。**

## 项目定位 / 背景

`agent_flow_tools` 是一套**本地优先的 Web MVP**，目的是解决一个被反复验证的痛点：**用 AI Agent 写大项目时，"任务怎么拆、依赖怎么画、产物怎么交接"完全靠人脑**。一旦任务超过 5 个粒度，AI 就会开始"降级实现"或"自欺欺人"地交付一个 demo。

它来自用户写下的 4 段核心理论（详见 `项目说明.md`）：

1. **信息熵理论** —— AI 是对概率最大值的补充，"边缘信息"没价值，只有核心信息能产出有价值的产物
2. **实践难题理论** —— 3A 级项目无法一次生成，必须先做总架构 + 全面细节
3. **工程实践理论** —— 大项目永远不止开发，还有测试/审核/重构/性能/日志/反馈
4. **工具迭代理论** —— 重复性问题要用工具解决，螺旋式上升

对应 4 个能力：

- **递归任务分解**：项目说明 → AI 追问 → 用户回答 → 子任务 → 原子任务
- **工作流系统**：每个任务有全局说明 + 当前任务 + 工具说明
- **接入主流 Agent 工具**：Codex CLI / OpenCode / Copilot Agent
- **自监督迭代系统**：每个子 Agent 完成任务后回调监督 Agent 派发下一任务

**当前版本是第一阶段（v0.1.0）**：只做浏览器内的"任务建模 + 任务单生成"，**不调任何真 Agent**。真实 CLI Agent 调度、进程监督、报告回调留到后续版本。

## 仓库结构

```
agent_flow_tools/
├── package.json                     # agent-flow-tools v0.1.0
├── vite.config.ts                   # 仅启用 @vitejs/plugin-react
├── tsconfig.json                    # 引用 vite/client types
├── index.html                       # SPA 入口（lang="zh-CN"）
├── README.md
├── 项目说明.md                       # 4 段核心理论中文手稿
└── src/
    ├── main.tsx                     # createRoot
    ├── App.tsx                      # 主界面：左侧任务树 + 中间节点详情 + 右侧工作流 + 状态徽章
    ├── styles.css                   # 自定义 CSS（节点图/侧边栏/状态色）
    ├── types.ts                     # FlowNode / FlowEdge / FlowQuestion / ServiceContract / AgentConnector / WorkflowStep
    ├── data/seed.ts                 # 初始任务图 + 工作流 + Agent 适配器 seed 数据
    └── lib/
        ├── storage.ts               # localStorage 持久化（key: agent-flow-tools.nodes.v1）
        └── taskExport.ts            # buildTaskSheet / buildServiceContract Markdown 生成
```

## 技术栈

| 维度 | 选型 | 版本/说明 |
|------|------|-----------|
| 框架 | React | ^19.2.1 |
| 语言 | TypeScript | ^5.9.3 |
| 构建 | Vite | ^7.2.7 |
| React 插件 | @vitejs/plugin-react | ^5.1.1 |
| 图标 | lucide-react | ^0.561.0（Activity / Bot / GitBranch / Network / ShieldCheck / Sparkles 等） |
| 类型 | @types/react / @types/react-dom | ^19.2.14 / ^19.2.3 |
| 持久化 | localStorage | 浏览器原生，key = `agent-flow-tools.nodes.v1` |
| 测试 | — | 当前无测试 |

## 核心模块 / 特性

### 1. 任务图（Task Graph）
`FlowNode` 字段：`id` / `parentId` / `title` / `kind`（project/module/atomic/workflow/gate）/ `status`（draft/questioning/ready/running/review/done/blocked）/ `summary` / `context` / `questions[]` / `service{ provides, consumes, acceptance }` / `agentProfile` / `toolNotes[]` / `x,y`。`FlowEdge` 记录 `from/to/label` 关系。`AgentConnector` 描述 Codex / OpenCode / Copilot Agent 的接入抽象（`command` / `status: planned|available|offline`）。

### 2. 节点详情（Side Panel）
选中任意节点后可编辑：标题、状态、摘要、上下文、问题答案（单选/多选/文本）、服务契约（向上提供 / 向下依赖 / 验收）、推荐 Agent 画像、工具说明列表。

### 3. 递归子任务
`createChildNode(parent, siblingCount)` —— 任何节点可一键新增 `atomic` 子任务，自动在父节点右下 280×120 偏移处排版，初始填入一条 `text` 类追问。

### 4. 任务单生成（`buildTaskSheet`）
导出 Markdown，含 6 段：
- 全局目标（来自 `projectBrief`）
- 当前任务（节点 ID / 类型 / 状态 / 推荐 Agent）
- 任务摘要
- 上下文
- 已确认问题（含答案）
- 可用工具与约束
- 验收标准

直接喂给下游 Agent 即可。

### 5. 服务接口生成（`buildServiceContract`）
3 段：向上提供、向下依赖、验收接口。配套一段"集成说明"提示"完成后把产物、测试结果、风险说明写入任务报告"。

### 6. 本地保存
`storage.ts` 三个函数：`loadNodes()` / `saveNodes(nodes)` / `resetNodes()`，全部基于 localStorage + JSON 序列化，启动时自动恢复。

### 7. Seed 数据
`data/seed.ts` 提供示范工程：根节点"Agent Flow Tools"、4 个子模块（递归任务分解 / 工作流系统 / 接入主流 Agent 工具 / 自监督迭代系统）、5 步标准工作流、3 个 Agent 适配器抽象。

## 已完成 / 进行中

- ✅ 4 段核心理论中文手稿（`项目说明.md`）
- ✅ FlowNode 7 种状态 + 5 种 kind 完整类型
- ✅ 任务树 / 节点详情 / 状态徽章
- ✅ 新增子任务（自动布局）
- ✅ 任务单 Markdown 导出
- ✅ 服务接口 Markdown 导出
- ✅ 3 个 Agent 适配器抽象定义
- ✅ localStorage 持久化 + 恢复
- ✅ 完整 seed 任务图（4 子模块 + 5 工作流 + 3 适配器）
- ⏳ 可视化节点图（README 提到"任务图"但当前版本用列表 + 卡片，没有力导向/拓扑图）
- ⏳ 真 Agent CLI 调度（Codex / OpenCode / Copilot）
- ⏳ 报告回调 + 自监督
- ⏳ 文件工作区持久化（project.json 导入导出）
- ⏳ 单元测试

## 本地开发

```bash
# 环境要求：Node 18+
cd agent_flow_tools
npm install
npm run dev
# → http://127.0.0.1:5173

# 生产构建
npm run build
npm run preview
```

`vite.config.ts` 强制 `--host 127.0.0.1`（仅本机访问，避免暴露未鉴权的本地工具）。

## 状态

**v0.1.0** —— 本地优先的 Web MVP，4 个基础闭环打通：任务拆解、任务图、节点详情、任务单生成。**未接入真 Agent**。

## License

MIT
