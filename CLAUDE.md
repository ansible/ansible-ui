# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Ansible Automation Platform (AAP) UI monorepo built with React, TypeScript, and PatternFly. The project uses NPM workspaces and is structured as a unified UI that integrates multiple services:

- **Platform** - Unified gateway UI for AAP (main entry point)
- **AWX** - Ansible Controller UI
- **EDA** - Event-Driven Ansible UI  
- **Hub** - Automation Hub UI
- **Chatbot** - Ansible Virtual Assistant UI
- **Framework** - Shared UI framework using PatternFly
- **Common** - Shared components and utilities

## Development Commands

### Root Level Commands (run from project root)
```bash
# Install dependencies
npm ci

# Run type checking across all workspaces
npm run tsc

# Run tests (TypeScript, ESLint, Prettier, Vitest)
npm test

# Run linting
npm run eslint
npm run eslint:fix

# Run formatting
npm run prettier
npm run prettier:fix

# Fix both linting and formatting
npm run fix

# Build all workspaces
npm run build

# Clean build artifacts
npm run clean

# Generate translations
npm run i18n

# Run Cypress E2E tests
npm run e2e:run
npm run e2e:run:awx
npm run e2e:run:hub
npm run e2e:run:eda
npm run e2e:run:chatbot

# Run component tests
npm run component
```

### Platform Development (run from `/platform` directory)
```bash
# Start platform development server
npm start

# Build platform for production
npm run build
```

### Running Tests
- **Unit/Component Tests**: `npm run vitest` (uses Vitest)
- **E2E Tests**: `npm run e2e:run` (uses Cypress)
- **Linting**: `npm run eslint`
- **Type Checking**: `npm run tsc`

## Architecture

### Monorepo Structure
The project uses NPM workspaces with the following structure:
- `/platform` - Main Platform UI (unified entry point)
- `/framework` - Shared UI framework
- `/frontend/awx` - AWX Controller UI
- `/frontend/eda` - Event-Driven Ansible UI
- `/frontend/hub` - Automation Hub UI
- `/frontend/chatbot` - Chatbot UI
- `/frontend/common` - Shared components
- `/cypress` - E2E tests
- `/playwright` - Additional E2E tests

### Key Technologies
- **React 18** with TypeScript
- **PatternFly** for UI components
- **React Hook Form** for form management
- **React Router** for navigation
- **SWR** for data fetching
- **i18next** for internationalization
- **Vite** for build tooling
- **Vitest** for unit testing
- **Cypress** for E2E testing
- **NX** for monorepo management

### API Integration
Each service has its own API prefix:
- Platform: `/api/gateway/`
- AWX: `/api/controller/v2/`
- EDA: `/api/eda/v1/`
- Hub: `/api/galaxy/`
Each route has a helper wrapper to route to the correct API based on the service that should be used in the code instead of the raw URL. This allows for easier integration and testing across services.
Example:
- gatewayAPI`/users/`
- awxAPI`/projects/`
- edaAPI`/events/`
- hubAPI`/collections/`


## Development Guidelines

### Code Organization
- Follow workspace-based architecture - each UI has its own workspace
- Use the shared framework for common UI patterns
- Place shared utilities in `/frontend/common`
- Use TypeScript interfaces for type safety

### Styling
- Use PatternFly components and design system
- CSS modules or styled-components for custom styling
- Follow PatternFly design guidelines

### State Management
- Use React hooks for local state
- SWR for server state management
- Zustand for global state when needed

### Testing
- Write unit tests with Vitest
- Use Playwright for E2E tests
- Follow testing best practices for React components

### Internationalization
- Use `useTranslation` hook from react-i18next
- Mark strings for translation with `t('String to translate')`
- Run `npm run i18n` to extract translation keys

## Environment Setup

### Required Environment Variables
```bash
# Platform server URL
export PLATFORM_SERVER='https://localhost:443'

# For standalone services (if needed)
export AWX_SERVER='https://localhost:8043'
export EDA_SERVER='http://localhost:8000'
export HUB_SERVER='http://localhost:5001'

# API prefixes
export AWX_API_PREFIX='/api/controller/v2'
export EDA_API_PREFIX='/api/eda/v1'
export HUB_API_PREFIX='/api/galaxy'
```

### Prerequisites
- Node.js 20.x or higher
- NPM 8.x or higher

## Common Development Tasks

### Adding New Features
1. Identify the appropriate workspace (platform, awx, eda, hub, etc.)
2. Create components in the relevant workspace
3. Use shared framework components when possible
4. Add tests for new functionality
5. Update translations if needed

### Working with Forms
- Use React Hook Form with the framework's form components
- Leverage existing form validation patterns
- Follow the PageForm patterns in the framework

### API Integration
- Use the appropriate API utilities for each service
- Follow existing patterns for error handling
- Use SWR for data fetching and caching

### Testing New Code
```bash
# Run all tests
npm test

# Run tests for specific workspace
cd frontend/awx && npm test

# Run E2E tests
npm run e2e:run
```

## Troubleshooting

### Common Issues
- **Build errors**: Run `npm run clean` then `npm ci`
- **Type errors**: Check TypeScript configuration in relevant workspace
- **Test failures**: Ensure all dependencies are installed and up to date
- **E2E test failures**: Check environment variables and server connectivity

### Log Access
- Platform logs: Check platform server logs
- Development logs: Check browser console and terminal output
- Test logs: Check test output and Cypress/Playwright reports