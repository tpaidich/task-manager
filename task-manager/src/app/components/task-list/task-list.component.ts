import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit, AfterViewInit {
  @ViewChild('editTaskModal') modalElement!: ElementRef<HTMLDivElement>;
  @ViewChild('projectModal') projectModalElement!: ElementRef<HTMLDivElement>;
  @ViewChild('editProjectModal') editProjectModalElement!: ElementRef<HTMLDivElement>;
  @ViewChild('viewTaskModal') viewTaskModalElement!: ElementRef<HTMLDivElement>;
  
  private editTaskModal: bootstrap.Modal | null = null;
  private projectModal: bootstrap.Modal | null = null;
  private editProjectModal: bootstrap.Modal | null = null;
  private viewTaskModal: bootstrap.Modal | null = null;

  tasks: Task[] = [];
  projects: Project[] = [];
  newTask: Partial<Task> = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'not_started',
    completed: false
  };
  newProject = {
    name: '',
    description: '',
    color: '#007bff'
  };
  editingTask: Task | null = null;
  editingProject: Project | null = null;
  selectedTaskForView: Task | null = null;

  // Update sorting options
  sortOptions = {
    not_started: { by: '', direction: 'asc' },
    in_progress: { by: '', direction: 'asc' },
    completed: { by: '', direction: 'asc' }
  };

  // Dropdown states
  dropdownStates = {
    not_started: false,
    in_progress: false,
    completed: false
  };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.cdr.markForCheck();
    });
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
      this.cdr.markForCheck();
    });

    // Subscribe to task updates
    this.taskService.tasksUpdated.subscribe(() => {
      this.taskService.getTasks().subscribe(tasks => {
        this.tasks = tasks;
        this.cdr.markForCheck();
      });
    });
  }

  ngAfterViewInit(): void {
    this.editTaskModal = new bootstrap.Modal(this.modalElement.nativeElement);
    this.projectModal = new bootstrap.Modal(this.projectModalElement.nativeElement);
    this.editProjectModal = new bootstrap.Modal(this.editProjectModalElement.nativeElement);
    if (this.viewTaskModalElement) {
      this.viewTaskModal = new bootstrap.Modal(this.viewTaskModalElement.nativeElement);
    }
  }

  toggleDropdown(status: 'not_started' | 'in_progress' | 'completed'): void {
    this.dropdownStates[status] = !this.dropdownStates[status];
    this.cdr.markForCheck();
  }

  updateSort(status: 'not_started' | 'in_progress' | 'completed', by: string): void {
    if (by === 'clear') {
      this.sortOptions[status] = { by: '', direction: 'asc' };
    } else if (this.sortOptions[status].by === by) {
      this.sortOptions[status].direction = this.sortOptions[status].direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortOptions[status] = { by, direction: 'asc' };
    }
    
    // Force update the tasks array to trigger change detection
    this.tasks = [...this.tasks];
    this.dropdownStates[status] = false;
    this.cdr.markForCheck();
  }

  openProjectModal(): void {
    this.newProject = {
      name: '',
      description: '',
      color: '#007bff'
    };
    this.projectModal?.show();
  }

  getTasksByStatus(status: 'not_started' | 'in_progress' | 'completed'): Task[] {
    const tasks = this.tasks.filter(task => task.status === status);
    return this.sortTasks(tasks, this.sortOptions[status]);
  }

  getTasksForProject(projectId: number): Task[] {
    return this.tasks.filter(task => task.projectId === projectId);
  }

  getProjectName(projectId?: number): string {
    if (!projectId) return 'No Project';
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }

  getProjectColor(projectId?: number): string {
    if (!projectId) return '#6c757d';
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.color : '#6c757d';
  }

  getStatusBadgeClass(status: Task['status']): string {
    switch (status) {
      case 'not_started':
        return 'bg-secondary';
      case 'in_progress':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  formatDueDate(dueDate: Date | string | undefined): string {
    if (!dueDate) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let date: Date;
    try {
      date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        return '';
      }
    } catch (e) {
      return '';
    }
    
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    
    if (diffDays <= 14) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[date.getDay()];
      const currentDayOfWeek = today.getDay();
      const targetDayOfWeek = date.getDay();
      let daysUntilTarget = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
      if (daysUntilTarget === 0) daysUntilTarget = 7;
      
      if (diffDays <= daysUntilTarget) {
        return `This ${dayName}`;
      } else {
        return `Next ${dayName}`;
      }
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Helper to update project priority based on its tasks
  private updateProjectPriority(projectId: number | undefined): void {
    if (!projectId) return;
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    const projectTasks = this.tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) {
      project.priority = 'none'; // Default if no tasks
    } else if (projectTasks.some(t => t.priority === 'high')) {
      project.priority = 'high';
    } else if (projectTasks.some(t => t.priority === 'medium')) {
      project.priority = 'medium';
    } else {
      project.priority = 'low';
    }
    this.projectService.updateProject(project);
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
      this.cdr.markForCheck();
    });
  }

  addTask(): void {
    if (this.newTask.title) {
      const task: Task = {
        id: Date.now(),
        title: this.newTask.title,
        description: this.newTask.description || '',
        priority: this.newTask.priority || 'medium',
        status: 'not_started',
        completed: false,
        projectId: this.newTask.projectId,
        dueDate: this.newTask.dueDate ? new Date(this.newTask.dueDate) : undefined
      };
      this.taskService.addTask(task);
      this.updateProjectPriority(task.projectId);
      this.newTask = {
        title: '',
        description: '',
        priority: 'medium',
        status: 'not_started'
      };
    }
  }

  addProject(): void {
    if (this.newProject.name) {
      const project: Project = {
        id: Date.now(),
        name: this.newProject.name,
        description: this.newProject.description || '',
        color: this.newProject.color || '#007bff',
        priority: 'none'
      };
      this.projectService.addProject(project);
      this.newProject = {
        name: '',
        description: '',
        color: '#007bff'
      };
      this.projectModal?.hide();
    }
  }

  toggleTask(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskService.updateTask(updatedTask);
  }

  updateTaskStatus(task: Task, status: Task['status']): void {
    const updatedTask = { ...task, status };
    this.taskService.updateTask(updatedTask);
  }

  deleteTask(task: Task): void {
    this.taskService.deleteTask(task.id);
    this.updateProjectPriority(task.projectId);
  }

  openEditModal(task: Task): void {
    this.editingTask = { 
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    };
    this.editTaskModal?.show();
  }

  saveEditedTask(): void {
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask);
      this.updateProjectPriority(this.editingTask.projectId);
      this.editTaskModal?.hide();
      this.editingTask = null;
    }
  }

  getTextColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  openEditProjectModal(project: Project): void {
    this.editingProject = { ...project };
    this.editProjectModal?.show();
  }

  saveEditedProject(): void {
    if (this.editingProject) {
      this.projectService.updateProject(this.editingProject);
      this.projectService.getProjects().subscribe(projects => {
        this.projects = projects;
        this.editProjectModal?.hide();
        this.editingProject = null;
      });
    }
  }

  deleteProject(): void {
    if (this.editingProject) {
      // First, delete all tasks associated with this project
      const projectTasks = this.tasks.filter(task => task.projectId === this.editingProject?.id);
      projectTasks.forEach(task => {
        this.taskService.deleteTask(task.id);
      });
      
      // Then delete the project
      this.projectService.deleteProject(this.editingProject.id);
      this.projectService.getProjects().subscribe(projects => {
        this.projects = projects;
        this.editProjectModal?.hide();
        this.editingProject = null;
      });
    }
  }

  sortTasks(tasks: Task[], options: { by: string, direction: string }): Task[] {
    if (!options.by) return tasks;
    
    return [...tasks].sort((a, b) => {
      if (options.by === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return options.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (options.by === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return options.direction === 'asc' 
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (options.by === 'project') {
        const projectA = a.projectId ? this.getProjectName(a.projectId) : '';
        const projectB = b.projectId ? this.getProjectName(b.projectId) : '';
        return options.direction === 'asc' 
          ? projectA.localeCompare(projectB)
          : projectB.localeCompare(projectA);
      }
      return 0;
    });
  }

  getSortIcon(status: 'not_started' | 'in_progress' | 'completed'): string {
    if (!this.sortOptions[status].by) return 'bi-filter';
    return this.sortOptions[status].direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  getSortText(status: 'not_started' | 'in_progress' | 'completed'): string {
    if (!this.sortOptions[status].by) return 'Sort';
    const direction = this.sortOptions[status].direction === 'asc' ? 'Ascending' : 'Descending';
    return `${this.sortOptions[status].by} (${direction})`;
  }

  openViewTaskModal(task: Task): void {
    this.selectedTaskForView = task;
    this.viewTaskModal?.show();
  }

  closeViewTaskModal(): void {
    this.selectedTaskForView = null;
    this.viewTaskModal?.hide();
  }
} 