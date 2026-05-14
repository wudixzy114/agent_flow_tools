import type { FlowNode } from '../types';

const formatAnswer = (answer: string | string[] | undefined) => {
  if (!answer || (Array.isArray(answer) && answer.length === 0)) {
    return '未回答';
  }

  return Array.isArray(answer) ? answer.join(', ') : answer;
};

export const buildTaskSheet = (node: FlowNode, globalBrief: string) => {
  const questions = node.questions
    .map((question) => `- ${question.prompt}\n  - 答案：${formatAnswer(question.answer)}`)
    .join('\n');

  const tools = node.toolNotes.map((tool) => `- ${tool}`).join('\n');
  const acceptance = node.service.acceptance.map((item) => `- ${item}`).join('\n');

  return `# 任务单：${node.title}

## 全局目标
${globalBrief}

## 当前任务
- 节点 ID：${node.id}
- 类型：${node.kind}
- 状态：${node.status}
- 推荐 Agent：${node.agentProfile}

## 任务摘要
${node.summary}

## 上下文
${node.context}

## 已确认问题
${questions || '- 暂无'}

## 可用工具与约束
${tools || '- 暂无'}

## 验收标准
${acceptance || '- 暂无'}
`;
};

export const buildServiceContract = (node: FlowNode) => {
  const provides = node.service.provides.map((item) => `- ${item}`).join('\n');
  const consumes = node.service.consumes.map((item) => `- ${item}`).join('\n');
  const acceptance = node.service.acceptance.map((item) => `- ${item}`).join('\n');

  return `# 服务接口任务单：${node.title}

## 向上提供
${provides || '- 暂无'}

## 向下依赖
${consumes || '- 暂无'}

## 验收接口
${acceptance || '- 暂无'}

## 集成说明
该节点完成后，需要把产物、测试结果、风险说明和后续建议写入任务报告，由父节点或监督工作流读取。
`;
};
