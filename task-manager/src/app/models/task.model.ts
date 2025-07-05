export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?: Date;
  projectId?: number; // Optional project assignment
} 