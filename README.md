# Task Manager

A modern, responsive task management application built with Angular 17 and Bootstrap 5 to organize your tasks and projects with an intuitive Kanban-style interface.

![Task Manager](https://img.shields.io/badge/Angular-17.3.0-red?style=for-the-badge&logo=angular)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.5-blue?style=for-the-badge&logo=bootstrap)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue?style=for-the-badge&logo=typescript)

## Features

- **Create, edit, and delete tasks** sorted by status, priority, and due date
- **Create custom projects** with names, descriptions, and color-coded indicators
- **Assign tasks to projects** for better organization
- **Kanban-style layout** with drag-and-drop ready structure
- **Local storage** - your data stays between sessions
- **No backend required** - runs entirely in your browser

## Getting Started
### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200` to view the application

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🛠Technical Details

### Built With
- **Angular 17** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Bootstrap 5** - CSS framework for responsive design
- **RxJS** - Reactive programming library

### Project Structure
```
src/
├── app/
│   ├── components/
│   │   └── task-list/          # Main task management component
│   │   ├── models/
│   │   │   ├── task.model.ts       # Task interface definition
│   │   │   └── project.model.ts    # Project interface definition
│   │   ├── services/
│   │   │   ├── task.service.ts     # Task data management
│   │   │   └── project.service.ts  # Project data management
│   │   └── app.component.*         # Root application component
│   └── app.component.*         # Root application component
```

### Key Components

#### Task Model
```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?: Date;
  projectId?: number;
}
```

#### Project Model
```typescript
interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  priority: 'none' | 'low' | 'medium' | 'high';
}
```

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests
