
export interface Student {
  id: string;
  name: string;
}

export interface PlacementStudent extends Student {
  gender: 'kille' | 'tjej' | 'okant';
  condition: 'ingen' | 'fram' | 'bak' | 'vid_vagg';
  notWith: string[];
  prefNotWith: string[];
  prefWith: string[];
  isPlaced?: boolean;
}

export interface Furniture {
  id: string;
  type: 'teacher' | 'door' | 'window' | 'carpet';
  x: number;
  y: number;
  label: string;
}

export interface Desk {
  id: number;
  x: number;
  y: number;
  student1Id: string | null;
  student2Id: string | null;
  isPerimeter?: boolean;
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
  ARRANGE = 'ARRANGE',
  VIDEO_PLAYER = 'VIDEO_PLAYER',
  QUICK_LINKS = 'QUICK_LINKS',
  PLACEMENT = 'PLACEMENT',
  LINK = 'LINK',
  LESSON_NAVIGATOR = 'LESSON_NAVIGATOR',
  TIERED_TASK = 'TIERED_TASK',
  MINDSET_CHECK = 'MINDSET_CHECK',
  CONVERSATION_BUBBLES = 'CONVERSATION_BUBBLES'
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
  data?: any; 
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
