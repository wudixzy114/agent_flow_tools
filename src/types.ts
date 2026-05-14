export type NodeStatus = 'draft' | 'questioning' | 'ready' | 'running' | 'review' | 'done' | 'blocked';

export type NodeKind = 'project' | 'module' | 'atomic' | 'workflow' | 'gate';

export type QuestionKind = 'single' | 'multiple' | 'text';

export interface FlowQuestion {
  id: string;
  prompt: string;
  kind: QuestionKind;
  options?: string[];
  answer?: string | string[];
}

export interface ServiceContract {
  provides: string[];
  consumes: string[];
  acceptance: string[];
}

export interface FlowNode {
  id: string;
  parentId?: string;
  title: string;
  kind: NodeKind;
  status: NodeStatus;
  summary: string;
  context: string;
  questions: FlowQuestion[];
  service: ServiceContract;
  agentProfile: string;
  toolNotes: string[];
  x: number;
  y: number;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface AgentConnector {
  id: string;
  name: string;
  command: string;
  status: 'planned' | 'available' | 'offline';
  notes: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  purpose: string;
  trigger: string;
  output: string;
}
