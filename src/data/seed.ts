import type { AgentConnector, FlowEdge, FlowNode, WorkflowStep } from '../types';

export const projectBrief = `目标：构建一个面向大型 AI Agent 项目的递归任务分解、工作流编排、多 Agent 工具接入、自监督迭代系统。

核心原则：
1. 用户提供高价值核心信息，系统持续追问并沉淀结构化上下文。
2. 大任务递归拆解为可以一次完成、可以验收、可以并行调度的原子任务。
3. 每个任务节点都生成任务单、服务接口、验收标准和工具说明。
4. 工作流不止开发，还覆盖测试、审核、性能、日志、反馈和复盘。
5. 工具链需要随项目演进持续沉淀，降低重复劳动。`;

export const initialNodes: FlowNode[] = [
  {
    id: 'project-root',
    title: 'Agent Flow Tools',
    kind: 'project',
    status: 'questioning',
    summary: '大型 AI Agent 项目的任务分解、工作流编排和自监督调度平台。',
    context: projectBrief,
    questions: [
      {
        id: 'q-root-1',
        kind: 'multiple',
        prompt: '第一阶段最需要打通哪些闭环？',
        options: ['递归任务分解', '节点图检查', '任务单生成', 'Agent 调用监控', '自监督回调'],
        answer: ['递归任务分解', '节点图检查', '任务单生成'],
      },
      {
        id: 'q-root-2',
        kind: 'text',
        prompt: '系统第一批服务的目标用户是谁？',
        answer: '需要用多个 AI Agent 开发复杂项目的个人开发者或小团队。',
      },
    ],
    service: {
      provides: ['全局项目说明', '任务树', '工作流定义', 'Agent 执行状态'],
      consumes: ['用户补充信息', 'Agent 运行报告', '工具执行结果'],
      acceptance: ['项目可在本地打开并编辑任务图', '任意节点可导出任务单', '系统有明确扩展点接入 Agent 工具'],
    },
    agentProfile: '产品架构 Agent + 编排 Agent',
    toolNotes: ['本地浏览器应用', '后续接入 CLI Agent 进程管理', '任务数据先使用 localStorage'],
    x: 120,
    y: 110,
  },
  {
    id: 'recursive-decomposition',
    parentId: 'project-root',
    title: '递归任务分解',
    kind: 'module',
    status: 'ready',
    summary: '从项目说明出发，通过追问、确认、拆分，得到可执行的原子任务树。',
    context: '输入项目说明，系统生成问题；用户回答后，系统继续拆分直到节点满足原子任务标准。',
    questions: [
      {
        id: 'q-rd-1',
        kind: 'single',
        prompt: '原子任务的最重要判定标准是什么？',
        options: ['一次 Agent 调用可完成', '代码少于 500 行', '只有一个文件', '不需要测试'],
        answer: '一次 Agent 调用可完成',
      },
      {
        id: 'q-rd-2',
        kind: 'text',
        prompt: '任务拆分时必须保留哪些上下文？',
        answer: '全局目标、父任务意图、输入输出、验收标准、依赖关系。',
      },
    ],
    service: {
      provides: ['任务树节点', '节点问题集', '原子任务判定结果'],
      consumes: ['项目说明', '用户回答', '拆分策略'],
      acceptance: ['节点可新增子任务', '问题可记录答案', '每个节点有任务单和接口说明'],
    },
    agentProfile: '需求分析 Agent',
    toolNotes: ['问题表单', '任务树编辑器', 'Markdown 导出'],
    x: 420,
    y: 70,
  },
  {
    id: 'workflow-system',
    parentId: 'project-root',
    title: '工作流系统',
    kind: 'module',
    status: 'draft',
    summary: '把需求、开发、测试、审核、性能对比、反馈复盘编排成可视化流程。',
    context: '每个任务都可以选择工作流模板，节点之间通过报告和工件传递上下文。',
    questions: [
      {
        id: 'q-wf-1',
        kind: 'multiple',
        prompt: '默认工作流应包含哪些阶段？',
        options: ['需求对齐', '实现', '自动测试', '对抗审核', '验收报告', '性能对比'],
        answer: ['需求对齐', '实现', '自动测试', '对抗审核', '验收报告'],
      },
    ],
    service: {
      provides: ['工作流模板', '节点执行顺序', '回调触发规则'],
      consumes: ['任务单', '工具说明', 'Agent 报告'],
      acceptance: ['可查看工作流图', '每个阶段定义输入输出', '失败节点能标记阻塞'],
    },
    agentProfile: '流程编排 Agent',
    toolNotes: ['状态机', '执行日志', '报告解析器'],
    x: 420,
    y: 250,
  },
  {
    id: 'agent-connectors',
    parentId: 'project-root',
    title: '主流 Agent 接入',
    kind: 'module',
    status: 'draft',
    summary: '抽象 Codex、Copilot、OpenCode 等 Agent 的调用、状态采集和报告回传。',
    context: '优先以本地 CLI 适配器方式接入，后续再扩展为守护进程、反向代理或远程执行器。',
    questions: [
      {
        id: 'q-ac-1',
        kind: 'single',
        prompt: '第一版适配器应优先支持哪种调用方式？',
        options: ['本地 CLI', 'HTTP 反向代理', '浏览器自动化', '远程队列'],
        answer: '本地 CLI',
      },
    ],
    service: {
      provides: ['Agent 适配器注册表', '健康检查状态', '执行报告入口'],
      consumes: ['任务单', '工作目录', '命令模板'],
      acceptance: ['适配器有统一字段', '可记录命令和状态', '设计支持异步回调'],
    },
    agentProfile: '工具接入 Agent',
    toolNotes: ['CLI wrapper', 'process supervisor', 'JSON report schema'],
    x: 760,
    y: 160,
  },
  {
    id: 'self-supervision',
    parentId: 'project-root',
    title: '自监督迭代',
    kind: 'module',
    status: 'draft',
    summary: '让监控 Agent 根据子 Agent 报告自动派发后续任务、审核和重试。',
    context: '监控层可以多级嵌套，以任务报告、测试结果、审核意见作为触发信号。',
    questions: [
      {
        id: 'q-ss-1',
        kind: 'text',
        prompt: '监控 Agent 判断任务完成需要哪些证据？',
        answer: '任务报告、文件变更、测试结果、验收清单、失败风险说明。',
      },
    ],
    service: {
      provides: ['监督策略', '回调协议', '自动派发规则'],
      consumes: ['Agent 报告', '工作流状态', '验收标准'],
      acceptance: ['完成报告可触发下一步', '阻塞报告可生成追问', '审核失败可派发修复任务'],
    },
    agentProfile: '监督 Agent',
    toolNotes: ['report webhook', 'policy evaluator', 'task scheduler'],
    x: 760,
    y: 340,
  },
  {
    id: 'atomic-ui',
    parentId: 'recursive-decomposition',
    title: '原子任务 UI',
    kind: 'atomic',
    status: 'ready',
    summary: '为单个节点提供详情、问题回答、任务单和服务接口视图。',
    context: '这是当前 MVP 已经实现的首个原子任务，用于验证节点闭环。',
    questions: [
      {
        id: 'q-ui-1',
        kind: 'single',
        prompt: '节点详情页第一优先级是什么？',
        options: ['编辑上下文', '导出任务单', '查看日志', '管理权限'],
        answer: '导出任务单',
      },
    ],
    service: {
      provides: ['节点详情面板', '任务单 Markdown', '服务接口 Markdown'],
      consumes: ['FlowNode 数据'],
      acceptance: ['切换节点后详情更新', '任务单包含上下文和验收标准', '问题答案可见'],
    },
    agentProfile: '前端实现 Agent',
    toolNotes: ['React state', 'Markdown text area', 'localStorage persistence'],
    x: 660,
    y: 30,
  },
];

export const initialEdges: FlowEdge[] = [
  { id: 'e-root-rd', from: 'project-root', to: 'recursive-decomposition', label: '拆解' },
  { id: 'e-root-wf', from: 'project-root', to: 'workflow-system', label: '编排' },
  { id: 'e-root-ac', from: 'project-root', to: 'agent-connectors', label: '接入' },
  { id: 'e-root-ss', from: 'project-root', to: 'self-supervision', label: '监督' },
  { id: 'e-rd-ui', from: 'recursive-decomposition', to: 'atomic-ui', label: '原子任务' },
  { id: 'e-wf-ss', from: 'workflow-system', to: 'self-supervision', label: '报告回调' },
  { id: 'e-ac-ss', from: 'agent-connectors', to: 'self-supervision', label: '状态采集' },
];

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'align',
    title: '需求对齐',
    purpose: '把含糊目标转成问题、答案、约束和验收标准。',
    trigger: '节点处于 draft 或 questioning',
    output: '确认后的任务单草稿',
  },
  {
    id: 'build',
    title: '实现执行',
    purpose: '选择合适 Agent 和工具完成节点任务。',
    trigger: '节点处于 ready',
    output: '代码、文档或工具变更',
  },
  {
    id: 'test',
    title: '测试验证',
    purpose: '运行自动化检查并记录结果。',
    trigger: '实现报告提交',
    output: '测试日志和失败摘要',
  },
  {
    id: 'review',
    title: '对抗审核',
    purpose: '从风险、遗漏、不可维护点检查实现质量。',
    trigger: '测试通过或需要人工判断',
    output: '审核结论和修复任务',
  },
  {
    id: 'accept',
    title: '验收归档',
    purpose: '将完成证据写回任务图，触发后续节点。',
    trigger: '审核通过',
    output: '任务完成报告',
  },
];

export const agentConnectors: AgentConnector[] = [
  {
    id: 'codex',
    name: 'Codex CLI',
    command: 'codex run --json <task-file>',
    status: 'planned',
    notes: '适合本地代码修改、测试、代码审核和多 Agent 工作区。',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    command: 'opencode run <task-file>',
    status: 'planned',
    notes: '可作为 CLI 适配器接入，统一采集 stdout、退出码和报告文件。',
  },
  {
    id: 'copilot',
    name: 'Copilot Agent',
    command: 'adapter/copy-task-to-copilot',
    status: 'planned',
    notes: '优先设计半自动桥接；完整自动化需要确认可用 API 或企业环境能力。',
  },
];
