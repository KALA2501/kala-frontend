# src Folder Structure

This folder contains the main source code for the application. Below is the structure based on the Bulletproof React architecture:

- **app/**: Application layer containing routes, main app component, providers, and router configuration.
- **assets/**: Static files such as images, fonts, etc.
- **components/**: Shared components used across the application.
- **config/**: Global configurations and exported environment variables.
- **features/**: Feature-based modules.
- **hooks/**: Shared hooks used across the application.
- **lib/**: Reusable libraries preconfigured for the application.
- **stores/**: Global state stores.
- **testing/**: Test utilities and mocks.
- **types/**: Shared TypeScript types used across the application.
- **utils/**: Shared utility functions.

Each feature in the `features/` folder can have its own structure, including `api/`, `assets/`, `components/`, `hooks/`, `stores/`, `types/`, and `utils/` as needed.
