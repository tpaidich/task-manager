import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [];
  private projectsSubject = new BehaviorSubject<Project[]>([]);

  constructor() {
    this.loadProjects();
  }

  private loadProjects(): void {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      this.projects = JSON.parse(savedProjects);
      this.projectsSubject.next(this.projects);
    }
  }

  getProjects() {
    return this.projectsSubject.asObservable();
  }

  addProject(project: Project): void {
    const newProject = {
      ...project,
      priority: project.priority || 'medium'
    };
    this.projects.push(newProject);
    this.saveProjects();
    this.projectsSubject.next(this.projects);
  }

  updateProject(project: Project): void {
    const index = this.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = {
        ...project,
        priority: project.priority || 'medium'
      };
      this.saveProjects();
      this.projectsSubject.next(this.projects);
    }
  }

  deleteProject(id: number): void {
    this.projects = this.projects.filter(p => p.id !== id);
    this.saveProjects();
  }

  private saveProjects(): void {
    localStorage.setItem('projects', JSON.stringify(this.projects));
    this.projectsSubject.next(this.projects);
  }
} 