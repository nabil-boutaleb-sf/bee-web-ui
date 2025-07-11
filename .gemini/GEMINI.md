# Gemini Agent Memo

This document provides context and guidance for the Gemini agent working on the Bee Web UI project.

## Project Overview

The Bee Web UI is a personal-use web application designed to provide a user-friendly interface for managing "todos" and "facts" from the `bee.computer` API. The primary motivation for this project was the difficulty of editing and deleting these items in the official UI.

The project is built with a Node.js/Express backend that serves a vanilla HTML, CSS, and JavaScript frontend. The backend uses the official `beeai` npm package to interact with the Bee API.

## Key Architectural Decisions

- **Backend as a Proxy:** The Node.js server acts as a proxy to the Bee API. This is a crucial security measure to protect the `BEE_API_TOKEN`, which is stored in a `.env` file on the server and should never be exposed to the frontend.
- **Multi-Page Application:** The application is structured with multiple pages for different functionalities (Home, Todos, Facts, Conversations).
- **Official SDK:** The project uses the `beeai` npm package for all interactions with the Bee API in the main application. This is the preferred method over direct API calls.
- **Markdown Rendering:** The `markdown-it` library is used for rendering markdown content, particularly for conversations. It is configured to support HTML, line breaks, and linkification.
- **Isolated Test Environment:** The project includes a dedicated test page (`public/test.html`) that uses a separate, isolated API router (`/test-api`) to make direct calls to the Bee API, bypassing the SDK. This allows for independent testing of the API.

## Common UI/CSS Patterns and Pitfalls

- **Flexbox Conflicts in List Items:** Be aware that global `li` (list item) styles (e.g., `display: flex`) can conflict with the rendering of complex, block-level content (like markdown-parsed HTML containing lists, tables, or paragraphs) within individual list items. When such conflicts occur, explicitly override the `display` property to `block` (or another appropriate block-level display) for the specific list item class (e.g., `.conversation-item`) to ensure proper rendering of nested block elements.

## Agent Instructions and Preferences

- **Graceful Failure:** The application should handle the absence of a `BEE_API_TOKEN` gracefully. The server should still start and the UI should display a "not connected" message, rather than crashing.
- **Documentation:** The agent is responsible for keeping the project documentation (`CHANGELOG.md`, `TASKS.md`, `DESIGN.md`,`test_cases.md`, `README.md`, and this file) up-to-date.
- **User Confidence:** When the user expresses confidence in a solution or direction, do not argue or question their judgment. Focus solely on following their instructions precisely.
- **Commit Message Formatting:**
    - Adhere to the 50/72 rule: The subject line (first line) must be 50 characters maximum. Body lines must be 72 characters maximum.
    - Commit messages must NOT contain backticks (`) or any other characters that might interfere with shell parsing or display in various Git tools.
- **Proactive Problem Solving:** Upon encountering failures or unexpected issues, prioritize independent problem-solving using available tools and context. Only involve the user after exhausting self-resolution attempts or when explicit user input/decision is absolutely necessary. Aim to provide actionable solutions or next steps for the agent, rather than immediately deferring to the user.
    - **Test-Driven Changes:** Do not add new application functionality or code solely to make a failing test pass. Report the failure, explain the reason (e.g., "the test requires an API endpoint that does not exist"), and ask the user for guidance on how to proceed.
    - **Tool/Environment Failures:** If a tool fails due to an environmental issue (e.g., missing authentication, uninstalled dependency), proactively guide the user on how to resolve that underlying issue so the agent can successfully execute the tool in the future, rather than asking the user to perform the task manually.
    - **Git Command Failures:** If a git command fails, attempt to pull from the remote (e.g., `origin`) before re-attempting the command.
    - **Terminal Command Execution:** When running terminal commands that might take a long time or block interaction, prefer running them in the background using `&` and redirecting their output to a file for later review.

## Current Project Status

- **Facts Page:** Considered feature-complete for the initial requirements.
- **Todos Page:** Functionality has been expanded to include editing, but there are known issues with pagination and loading.
- **Conversations Page:** Very basic implementation that needs significant improvement to be useful.
- **Test Page:** Functioning as an independent test environment for the Bee API.