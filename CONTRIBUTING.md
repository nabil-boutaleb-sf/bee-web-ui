# Contributing to Bee Web UI

We welcome contributions to the Bee Web UI project! Whether you're fixing a bug, adding a new feature, improving documentation, or suggesting enhancements, your help is appreciated.

## How to Contribute

1.  **Fork the Repository:** Start by forking the `bee-web-ui` repository to your GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine
4.  **Create a New Branch:** Create a new branch for your feature or bug fix. Use a descriptive name (e.g., `feat/add-dark-mode`, `fix/login-bug`).
5.  **Configure API Token:**
    *   For development, it's recommended to create a `.env` file in the project root and add your `BEE_API_TOKEN`:
        ```
        BEE_API_TOKEN=your_bee_api_token_here
        ```
    *   Alternatively, you can use the in-browser API key submission on the home page.
6.  **Make Your Changes:** Implement your feature or bug fix. Ensure your code adheres to the existing style and conventions.
7.  **Write Tests:** For new features or significant bug fixes, please write corresponding Playwright end-to-end tests in the `tests/` directory.
8.  **Run Tests:** Before committing, run all tests to ensure your changes haven't introduced any regressions.
9.  **Manual Testing:** Perform a brief manual test of the affected functionality in your browser.
10. **Update Documentation:** If your changes affect how the application is used, installed, or configured, please update the relevant documentation (`README.md`, `CHANGELOG.md`, `DESIGN.md`, `TASKS.md`).
11. **Commit Your Changes:** Commit your changes with a clear and concise commit message. Follow the [Commit Message Formatting](#commit-message-formatting) guidelines (if defined in `GEMINI.md`).
12. **Push to Your Fork:** Push your new branch to your forked repository on GitHub.
13. **Create a Pull Request:** Go to the original `bee-web-ui` repository on GitHub and open a new Pull Request from your forked branch. Provide a clear description of your changes.

## Code Style

*   Follow the existing code style and formatting. We aim for consistency.

## Reporting Bugs

If you find a bug, please open an issue on GitHub. Before opening a new issue, please search existing issues to see if it has already been reported.

## Feature Requests

We welcome ideas for new features! Please open an issue on GitHub to propose new features or discuss existing ones.
