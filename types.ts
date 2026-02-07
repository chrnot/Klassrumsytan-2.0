
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
  CHECKLIST = 'CHECKLIST',
  WHITEBOARD = 'WHITEBOARD',
  QR_CODE = 'QR_CODE',
  BACKGROUND = 'BACKGROUND',
  POLLING = 'POLLING',
  MATTEYTAN = 'MATTEYTAN',
  IMAGE_ANNOTATOR = 'IMAGE_ANNOTATOR',
  ARRANGE = 'ARRANGE'
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

export interface PageData {
  id: string;
  name: string;
  background: string;
  widgets: WidgetInstance[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isSpotlight: boolean;
  timerSeconds?: number;
}
