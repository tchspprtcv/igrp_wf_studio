# IGRP Workflow Studio

A modern workflow designer and management application built with React, TypeScript, and BPMN.js.

## Features

- 🔄 Visual BPMN process designer
- 📁 Hierarchical organization with Applications, Areas, and SubAreas
- 🚀 Modern and responsive UI built with React and Tailwind CSS
- 🔒 Type-safe development with TypeScript
- 📦 Modular architecture with monorepo structure
- 💾 Flexible workspace storage (defaults to local file system, engine can be configured for others like MinIO)

## Project Structure

```
packages/
├── igrp-wf-engine/      # Core workflow engine library
│   ├── src/
│   │   ├── core/        # Core business logic for managing workspaces and processes
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions (e.g., file system interaction)
│   └── package.json
│
└── igrp-wf-studio-ui/   # React-based UI application
    ├── src/
    │   ├── components/  # Reusable UI components (BPMN editor, modals, etc.)
    │   ├── app/         # Next.js app router (pages and layouts)
    │   ├── services/    # Client-side services (e.g., EditorService)
    │   ├── igrpwfstudio/ # Studio-specific utilities (workspace catalog, manager)
    │   └── lib/         # General utility functions
    └── package.json
```

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Workspace Storage:**
    The IGRP Workflow Studio manages workspaces, which are essentially directories on your file system. The location of these workspaces is tracked by a catalog file stored in your home directory (`~/.igrp_wf_studio/workspaces_catalog.json`).
    *   When you create a new workspace through the Studio UI, you will specify a base path where this workspace's directory will be created.
    *   The core `igrp-wf-engine` reads and writes files (like `project-config.json`, BPMN files) within these workspace directories.

3.  **Environment Variables (for UI development):**
    While the core storage is file-system based as managed by the catalog, the UI might have example environment variables for other services. Create a `.env.local` file in the `packages/igrp-wf-studio-ui` directory if specific UI features require them (e.g., for alternative backend connections if the engine's storage is swapped).
    The example `.env.example` might contain MinIO variables. MinIO is one potential backend the `igrp-wf-engine` *could* be adapted to use for storing process definitions and related artifacts, but the Studio's default interaction via `workspaceManager.ts` uses the file system approach described above.
    ```
    # Example for packages/igrp-wf-studio-ui/.env.local (if needed for specific UI features)
    # VITE_MINIO_ENDPOINT=http://localhost:9000
    # ... other MinIO vars
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    This usually starts the Next.js UI application.

5.  **Open in Browser:**
    Access [http://localhost:5173](http://localhost:5173) (or the port specified by `npm run dev`).

## Core Features

### Workspaces (formerly Applications)
- Create and manage Workspaces: Each workspace is a self-contained project directory.
- Organize processes in a hierarchical structure (Workspace -> Areas -> SubAreas -> Processes).
- Track workspace status and metadata via `app-options.json` and `project-config.json` within its directory.

### Areas & SubAreas
- Group related processes into logical Areas.
- Create nested organization with SubAreas within Areas.
- Configuration is stored in the workspace's `project-config.json`.

### Process Designer
- Visual BPMN 2.0 process designer using `bpmn-js`.
- Real-time process validation (basic, provided by `bpmn-js`).
- Properties panel for configuring BPMN element attributes.
- Import/Export of BPMN diagrams (manual file operations currently, can be enhanced).
- Process definitions (BPMN XML) are stored as `.bpmn` files within the area/sub-area directories of a workspace.

### Storage Mechanism
- **Primary (Studio Interaction):** The Studio UI, through `workspaceManager.ts`, interacts with the `igrp-wf-engine`. This engine, by default, uses a local file system approach. A catalog (`~/.igrp_wf_studio/workspaces_catalog.json`) tracks the base paths of different workspaces. All process definitions and configurations are stored within these workspace directories.
- **MinIO (Engine Capability - Optional/Alternative):** The `igrp-wf-engine` *could* be configured or extended to use object storage like MinIO as a backend for process definitions and artifacts. The `.env.example` variables related to MinIO are for such scenarios or if specific UI components are built to interact directly with a MinIO-backed engine. The default Studio setup does not require MinIO to function for workspace and process management.


## Development

### Engine Package (`igrp-wf-engine`)
The `igrp-wf-engine` is a Node.js library responsible for the core logic of managing workflow structures and process definitions.
- It operates on a given `basePath` which corresponds to a specific workspace's root directory.
- Key modules:
    - `WorkflowWorkspaceManager`: Handles CRUD for workspaces (directory structure, `app-options.json`, `project-config.json`), areas, sub-areas, and process metadata.
    - `ProcessManager`: Handles reading and writing of BPMN XML files.

The core workflow engine provides:
- Application management
- Process definition handling
- File system operations
- Type definitions

### UI Package (`igrp-wf-studio-ui`)

The user interface built with:
- React for component architecture
- Tailwind CSS for styling
- BPMN.js for process modeling
- React Router for navigation

### Environment Configuration

The application uses environment variables for configuration:
- Create a `.env.local` file in the `packages/igrp-wf-studio-ui` directory
- Variables are prefixed with `VITE_` to be accessible in the client-side code
- MinIO configuration includes endpoint, credentials, and bucket settings
- The `.env.example` file provides a template with default values

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
