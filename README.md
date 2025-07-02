# IGRP Workflow Studio

A modern workflow designer and management application built with React, TypeScript, and BPMN.js.

## Features

- 🔄 Visual BPMN process designer
- 📁 Hierarchical organization with Applications, Areas, and SubAreas
- 🚀 Modern and responsive UI built with React and Tailwind CSS
- 🔒 Type-safe development with TypeScript
- 📦 Modular architecture with monorepo structure

## Project Structure

```
packages/
├── igrp-wf-engine/      # Core workflow engine library
│   ├── src/
│   │   ├── core/        # Core business logic
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── package.json
│
└── igrp-wf-studio-ui/   # React-based UI application
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Application pages
    │   └── lib/         # Utility functions
    └── package.json
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Create a `.env.local` file in the `packages/igrp-wf-studio-ui` directory
   - Use the `.env.example` file as a template
   - Set the MinIO configuration variables:
     ```
     VITE_MINIO_ENDPOINT=http://localhost:9000
     VITE_MINIO_REGION=GMT-1
     VITE_MINIO_ACCESS_KEY=your_access_key_here
     VITE_MINIO_SECRET_KEY=your_secret_key_here
     VITE_MINIO_BUCKET_NAME=igrp-wf
     VITE_MINIO_FORCE_PATH_STYLE=true
     ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Core Features

### Applications
- Create and manage workflow applications
- Organize processes in a hierarchical structure
- Track application status and metadata

### Areas & SubAreas
- Group related processes into areas
- Create nested organization with subareas
- Manage area-specific settings and permissions

### Process Designer
- Visual BPMN 2.0 process designer
- Real-time process validation
- Properties panel for element configuration
- Import/Export BPMN diagrams

### MinIO Integration
- Storage of BPMN process definitions
- Secure file management with configurable credentials
- Environment-based configuration for different deployment scenarios

## Development

### Engine Package (`igrp-wf-engine`)

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
