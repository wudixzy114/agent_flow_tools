import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  FileDown,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Network,
  PanelRight,
  Plus,
  RefreshCcw,
  Route,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { agentConnectors, initialEdges, projectBrief, workflowSteps } from './data/seed';
import { buildServiceContract, buildTaskSheet } from './lib/taskExport';
import { loadNodes, resetNodes, saveNodes } from './lib/storage';
import type { FlowNode, NodeStatus } from './types';

const statusLabels: Record<NodeStatus, string> = {
  draft: '草稿',
  questioning: '追问中',
  ready: '可执行',
  running: '执行中',
  review: '审核中',
  done: '完成',
  blocked: '阻塞',
};

const statusOrder: NodeStatus[] = ['draft', 'questioning', 'ready', 'running', 'review', 'done', 'blocked'];

const statusClass: Record<NodeStatus, string> = {
  draft: 'status-draft',
  questioning: 'status-questioning',
  ready: 'status-ready',
  running: 'status-running',
  review: 'status-review',
  done: 'status-done',
  blocked: 'status-blocked',
};

const createChildNode = (parent: FlowNode, siblingCount: number): FlowNode => ({
  id: `${parent.id}-child-${Date.now()}`,
  parentId: parent.id,
  title: `${parent.title} 子任务 ${siblingCount + 1}`,
  kind: 'atomic',
  status: 'draft',
  summary: '描述这个子任务要一次性完成的可验收目标。',
  context: `父任务：${parent.title}\n\n请补充输入、输出、约束和完成证据。`,
  questions: [
    {
      id: `q-${Date.now()}`,
      kind: 'text',
      prompt: '这个任务完成后，父节点可以获得什么明确产物？',
      answer: '',
    },
  ],
  service: {
    provides: ['待定义产物'],
    consumes: ['父任务上下文'],
    acceptance: ['补充可验证的完成标准'],
  },
  agentProfile: '待分配 Agent',
  toolNotes: ['补充该任务需要的工具说明'],
  x: parent.x + 280,
  y: parent.y + 120 + siblingCount * 120,
});

function App() {
  const [nodes, setNodes] = useState<FlowNode[]>(() => loadNodes());
  const [selectedId, setSelectedId] = useState(nodes[0]?.id ?? 'project-root');
  const [activeExport, setActiveExport] = useState<'task' | 'service'>('task');

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? nodes[0],
    [nodes, selectedId],
  );

  const edges = useMemo(() => {
    const dynamicEdges = nodes
      .filter((node) => node.parentId)
      .map((node) => ({
        id: `edge-${node.parentId}-${node.id}`,
        from: node.parentId!,
        to: node.id,
        label: node.kind === 'atomic' ? '拆分' : '包含',
      }));

    const seedEdgeIds = new Set(dynamicEdges.map((edge) => `${edge.from}-${edge.to}`));
    return [
      ...initialEdges.filter((edge) => nodes.some((node) => node.id === edge.from) && nodes.some((node) => node.id === edge.to)),
      ...dynamicEdges.filter((edge) => !seedEdgeIds.has(`${edge.from}-${edge.to}`) || !initialEdges.some((seed) => seed.from === edge.from && seed.to === edge.to)),
    ];
  }, [nodes]);

  const exportText = selectedNode
    ? activeExport === 'task'
      ? buildTaskSheet(selectedNode, projectBrief)
      : buildServiceContract(selectedNode)
    : '';

  const nodeMetrics = useMemo(() => {
    const ready = nodes.filter((node) => node.status === 'ready').length;
    const done = nodes.filter((node) => node.status === 'done').length;
    const questions = nodes.reduce((total, node) => total + node.questions.length, 0);
    return { ready, done, questions, total: nodes.length };
  }, [nodes]);

  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  const updateSelectedNode = (patch: Partial<FlowNode>) => {
    if (!selectedNode) {
      return;
    }

    setNodes((current) => current.map((node) => (node.id === selectedNode.id ? { ...node, ...patch } : node)));
  };

  const updateQuestionAnswer = (questionId: string, value: string) => {
    if (!selectedNode) {
      return;
    }

    setNodes((current) =>
      current.map((node) => {
        if (node.id !== selectedNode.id) {
          return node;
        }

        return {
          ...node,
          questions: node.questions.map((question) =>
            question.id === questionId
              ? {
                  ...question,
                  answer: question.kind === 'multiple' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value,
                }
              : question,
          ),
        };
      }),
    );
  };

  const addChild = () => {
    if (!selectedNode) {
      return;
    }

    const siblingCount = nodes.filter((node) => node.parentId === selectedNode.id).length;
    const child = createChildNode(selectedNode, siblingCount);
    setNodes((current) => [...current, child]);
    setSelectedId(child.id);
  };

  const resetWorkspace = () => {
    const freshNodes = resetNodes();
    setNodes(freshNodes);
    setSelectedId(freshNodes[0].id);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">
            <Sparkles size={16} />
            Agent Flow Tools
          </div>
          <h1>递归任务分解与 Agent 工作流编排台</h1>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" title="重置本地任务数据" onClick={resetWorkspace}>
            <RefreshCcw size={18} />
          </button>
          <button className="primary-button" onClick={addChild}>
            <Plus size={18} />
            新增子任务
          </button>
        </div>
      </header>

      <section className="metric-strip">
        <Metric icon={<Network size={20} />} label="节点" value={`${nodeMetrics.total}`} />
        <Metric icon={<CircleDot size={20} />} label="可执行" value={`${nodeMetrics.ready}`} />
        <Metric icon={<CheckCircle2 size={20} />} label="完成" value={`${nodeMetrics.done}`} />
        <Metric icon={<ClipboardList size={20} />} label="问题" value={`${nodeMetrics.questions}`} />
      </section>

      <section className="workspace-grid">
        <aside className="left-panel">
          <SectionTitle icon={<LayoutDashboard size={18} />} title="任务树" />
          <div className="node-list">
            {nodes.map((node) => (
              <button
                className={`node-list-item ${node.id === selectedNode?.id ? 'selected' : ''}`}
                key={node.id}
                onClick={() => setSelectedId(node.id)}
              >
                <span className={`status-dot ${statusClass[node.status]}`} />
                <span>
                  <strong>{node.title}</strong>
                  <small>{node.kind} · {statusLabels[node.status]}</small>
                </span>
              </button>
            ))}
          </div>

          <SectionTitle icon={<Route size={18} />} title="默认工作流" />
          <div className="workflow-list">
            {workflowSteps.map((step, index) => (
              <article className="workflow-step" key={step.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.output}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <section className="graph-panel">
          <SectionTitle icon={<GitBranch size={18} />} title="可视化任务图" />
          <div className="graph-canvas">
            <svg className="edge-layer" viewBox="0 0 1040 520" aria-hidden="true">
              {edges.map((edge) => {
                const from = nodes.find((node) => node.id === edge.from);
                const to = nodes.find((node) => node.id === edge.to);
                if (!from || !to) {
                  return null;
                }

                const x1 = from.x + 110;
                const y1 = from.y + 34;
                const x2 = to.x + 10;
                const y2 = to.y + 34;
                const midX = (x1 + x2) / 2;
                return (
                  <g key={edge.id}>
                    <path d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`} />
                    <text x={midX - 18} y={(y1 + y2) / 2 - 8}>
                      {edge.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            {nodes.map((node) => (
              <button
                key={node.id}
                className={`graph-node ${node.kind} ${node.id === selectedNode?.id ? 'active' : ''}`}
                style={{ left: node.x, top: node.y }}
                onClick={() => setSelectedId(node.id)}
              >
                <span className={`status-dot ${statusClass[node.status]}`} />
                <strong>{node.title}</strong>
                <small>{statusLabels[node.status]}</small>
              </button>
            ))}
          </div>
        </section>

        {selectedNode && (
          <aside className="right-panel">
            <SectionTitle icon={<PanelRight size={18} />} title="节点详情" />
            <label className="field">
              <span>标题</span>
              <input value={selectedNode.title} onChange={(event) => updateSelectedNode({ title: event.target.value })} />
            </label>
            <label className="field">
              <span>状态</span>
              <select
                value={selectedNode.status}
                onChange={(event) => updateSelectedNode({ status: event.target.value as NodeStatus })}
              >
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>摘要</span>
              <textarea
                rows={3}
                value={selectedNode.summary}
                onChange={(event) => updateSelectedNode({ summary: event.target.value })}
              />
            </label>
            <label className="field">
              <span>上下文</span>
              <textarea
                rows={6}
                value={selectedNode.context}
                onChange={(event) => updateSelectedNode({ context: event.target.value })}
              />
            </label>

            <SectionTitle icon={<ListChecks size={18} />} title="补充问题" />
            <div className="question-list">
              {selectedNode.questions.map((question) => (
                <label className="field question-field" key={question.id}>
                  <span>{question.prompt}</span>
                  {question.options?.length ? (
                    <small>可选：{question.options.join(' / ')}</small>
                  ) : null}
                  <textarea
                    rows={question.kind === 'text' ? 3 : 2}
                    value={Array.isArray(question.answer) ? question.answer.join(', ') : question.answer ?? ''}
                    onChange={(event) => updateQuestionAnswer(question.id, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </aside>
        )}
      </section>

      <section className="lower-grid">
        <section className="export-panel">
          <SectionTitle icon={<FileDown size={18} />} title="任务单生成" />
          <div className="segmented">
            <button className={activeExport === 'task' ? 'active' : ''} onClick={() => setActiveExport('task')}>
              <ClipboardList size={16} />
              任务单
            </button>
            <button className={activeExport === 'service' ? 'active' : ''} onClick={() => setActiveExport('service')}>
              <Save size={16} />
              服务接口
            </button>
          </div>
          <textarea className="export-text" value={exportText} readOnly />
        </section>

        <section className="agent-panel">
          <SectionTitle icon={<Bot size={18} />} title="Agent 适配器注册表" />
          <div className="connector-list">
            {agentConnectors.map((connector) => (
              <article className="connector-card" key={connector.id}>
                <div>
                  <strong>{connector.name}</strong>
                  <span>{connector.status}</span>
                </div>
                <code>{connector.command}</code>
                <p>{connector.notes}</p>
              </article>
            ))}
          </div>

          <SectionTitle icon={<ShieldCheck size={18} />} title="监督回调协议" />
          <div className="callback-box">
            <Activity size={20} />
            <p>
              子 Agent 完成后提交报告：任务 ID、执行摘要、变更文件、测试结果、风险、下一步建议。
              监督节点读取报告后更新状态，并按工作流派发审核、修复或后续任务。
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="section-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="metric">
      {icon}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default App;
