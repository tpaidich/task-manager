import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasksUpdated = new EventEmitter<void>();

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Convert date strings back to Date objects
      this.tasks = parsedTasks.map((task: any) => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : undefined;
        return {
          ...task,
          dueDate: dueDate && !isNaN(dueDate.getTime()) ? dueDate : undefined
        };
      });
      this.tasksSubject.next(this.tasks);
    }
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(task: Omit<Task, 'id'>): void {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      status: 'not_started',
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    };
    this.tasks.push(newTask);
    this.saveTasks();
  }

  updateTaskStatus(taskId: number, status: Task['status']): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      this.saveTasks();
    }
  }

  updateTask(updatedTask: Task): void {
    const index = this.tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      const dueDate = updatedTask.dueDate ? new Date(updatedTask.dueDate) : undefined;
      this.tasks[index] = {
        ...updatedTask,
        dueDate: dueDate && !isNaN(dueDate.getTime()) ? dueDate : undefined
      };
      this.saveTasks();
    }
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
  }

  private saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.tasksSubject.next(this.tasks);
    this.tasksUpdated.emit();
  }
} 