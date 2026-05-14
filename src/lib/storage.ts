import type { FlowNode } from '../types';
import { initialNodes } from '../data/seed';

const STORAGE_KEY = 'agent-flow-tools.nodes.v1';

export const loadNodes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialNodes;
    }

    return JSON.parse(raw) as FlowNode[];
  } catch {
    return initialNodes;
  }
};

export const saveNodes = (nodes: FlowNode[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
};

export const resetNodes = () => {
  localStorage.removeItem(STORAGE_KEY);
  return initialNodes;
};
