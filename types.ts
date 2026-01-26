
export interface Student {
  id: string;
  name: string;
}

export interface Group {
  id: number;
  members: Student[];
}

export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  TIMER = 'TIMER',
  RANDOMIZER = 'RANDOMIZER',
  NOISE_METER = 'NOISE_METER',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
  GROUPING = 'GROUPING',
  ASSISTANT = 'ASSISTANT',
  INSTRUCTIONS = 'INSTRUCTIONS',
  BACKGROUND = 'BACKGROUND',
  POLLING = 'POLLING',
  MATTEYTAN = 'MATTEYTAN'
}

export interface WidgetInstance {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex: number;
  isOpen: boolean;
}

export interface AppSettings {
  background: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
