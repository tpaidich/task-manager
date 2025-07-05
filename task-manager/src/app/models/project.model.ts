export interface Project {
  id: number;
  name: string;
  description: string;
  color: string; // For visual identification
  priority: 'none' | 'low' | 'medium' | 'high';
} 