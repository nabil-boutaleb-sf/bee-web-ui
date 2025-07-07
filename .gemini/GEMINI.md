# Gemini Agent Memo

This document provides context and guidance for the Gemini agent working on the Bee Web UI project.

## Project Overview

The Bee Web UI is a personal-use web application designed to provide a user-friendly interface for managing "todos" and "facts" from the `bee.computer` API. The primary motivation for this project was the difficulty of editing and deleting these items in the official UI.

The project is built with a Node.js/Express backend that serves a vanilla HTML, CSS, and JavaScript frontend. The backend uses the official `beeai` npm package to interact with the Bee API.

## Key Architectural Decisions

- **Backend as a Proxy:** The Node.js server acts as a proxy to the Bee API. This is a crucial security measure to protect the `BEE_API_TOKEN`, which is stored in a `.env` file on the server and should never be exposed to the frontend.
- **Multi-Page Application:** The application is structured with multiple pages for different functionalities (Home, Todos, Facts, Conversations).
- **Official SDK:** The project uses the `beeai` npm package for all interactions with the Bee API in the main application. This iOks the preferred method over direct API calls.
- **Isolated Test Environment:** The project includes a dedicated test page (`public/test.html`) that uses a separate, isolated API router (`/test-api`) to make direct calls to the Bee API, bypassing the SDK. This allows for independent testing of the API.

## Agent Instructions and Preferences

- **Graceful Failure:** The application should handle the absence of a `BEE_API_TOKEN` gracefully. The server should still start and the UI should display a "not connected" message, rather than crashing.
- **Documentation:** The agent is responsible for keeping the project documentation (`CHANGELOG.md`, `TASKS.md`, `DESIGN.md`,`test_cases.md`, `README.md`, and this file) up-to-date.

## Current Project Status

- **Facts Page:** Considered feature-complete for the initial requirements.
- **Todos Page:** Functionality has been expanded to include editing, but there are known issues with pagination and loading.
- **Conversations Page:** Very basic implementation that needs significant improvement to be useful.
- **Test Page:** Functioning as an independent test environment for the Bee API.
