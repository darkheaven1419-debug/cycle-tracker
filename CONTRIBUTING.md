# Contributing to Anđelin Ciklus

Thank you for considering contributing to **Anđelin Ciklus** — a personal cycle tracker and cross-cultural love diary. This document outlines the conventions and processes for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. This project is built with love — let's keep the community that way too.

## Getting Started

### Prerequisites

- A modern browser (Chrome, Firefox, Safari, Edge)
- Python 3 or Node.js (for local server, optional but recommended for PWA)

### Local Setup

This is a zero-dependency static PWA — no build tools or `npm install` required.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/cycle-tracker.git
   cd cycle-tracker
   ```

2. **Open the app:**

   ```bash
   # Option A: Open directly (no PWA features)
   open index.html        # macOS
   start index.html       # Windows

   # Option B: Local server (recommended for PWA + sync)
   python -m http.server 8080
   # or
   npx serve .
   ```

3. Open `http://localhost:8080` in your browser.

### Logging In for Testing

| User | PIN | Features |
|------|-----|----------|
| Anđela | `1909` | Cycle tracking + diary |
| Barry | `0827` | Shared diary + relationship features |

## Code Style

### Linting

This project uses **ESLint** with the following key rules (see `.eslintrc.json`):

- `no-console` — warn, only `console.warn`, `console.error`, `console.info` are allowed
- `no-debugger` — error, never commit debugger statements
- `no-unused-vars` — warn
- `eqeqeq` — use `===` and `!==` (smart mode allows `== null`)

To run the linter:

```bash
npx eslint .
```

### Formatting

This project uses **Prettier** with the following settings (see `.prettierrc`):

- Semicolons: **required**
- Quotes: **single** (single quotes preferred)
- Tab width: **2 spaces**
- Trailing commas: **ES5** (commas where valid in ES5)
- Print width: **160 characters**

To format your code:

```bash
npx prettier --write .
```

### General Guidelines

- **Immutability:** Create new objects instead of mutating existing ones
- **Functions:** Keep functions focused and under 50 lines where practical
- **Files:** Keep files under 800 lines; extract modules when they grow
- **Nesting:** Avoid more than 4 levels of nesting — prefer early returns
- **Naming:**
  - Variables and functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Booleans: `is`/`has`/`should`/`can` prefixes
- **No hardcoded secrets:** Use environment variables or config for API keys
- **No debug artifacts:** Remove `console.log` and `debugger` statements before committing

### Project Structure

The app follows a modular vanilla JS architecture:

```
cycle-tracker/
├── index.html               ← Entry point
├── styles.css               ← All styles (design tokens + components)
├── app.js                   ← Main application logic
├── js/                      ← Modular JavaScript
│   ├── auth.js              ← Dual-user authentication
│   ├── i18n.js              ← 3-language translations (sr/zh-CN/en)
│   ├── cycle-core.js        ← Date utilities + cycle prediction
│   ├── chart-renderer.js    ← Canvas charts
│   ├── sync.js              ← GitHub API sync engine
│   ├── weather.js           ← Dual-city weather
│   ├── lunar.js             ← Chinese lunar calendar
│   ├── calendar-culture.js  ← Holidays & solar terms
│   ├── chinese-learn.js     ← Learning engine
│   ├── chinese-ui.js        ← Learning UI components
│   ├── chinese-quiz.js      ← Quiz system
│   ├── chinese-panels.js    ← Learning panels
│   └── chinese-listen.js    ← Listening practice
├── data/                    ← Data files
├── calendar-data.json       ← Holiday & solar term data
├── manifest.json            ← PWA manifest
├── sw.js                    ← Service Worker
└── tests/test-core.js       ← Unit tests
```

## Commit Messages

This project uses **Conventional Commits**:

```
<type>: <short description>

<optional body>
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `chore` | Maintenance, config, tooling |
| `perf` | Performance improvement |
| `style` | Formatting, linting (no logic change) |

### Examples

```
feat: add lunar phase indicator to calendar view

fix: correct cycle phase calculation for short cycles

refactor: extract weather module from app.js

docs: update README with new feature list
```

## Pull Request Process

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the code style guidelines above.

3. **Run the linter and formatter:**

   ```bash
   npx eslint .
   npx prettier --check .
   ```

4. **Test manually** by opening the app at `http://localhost:8080` and verifying:
   - The feature works as expected
   - No regressions in existing features
   - Both light and dark themes work
   - The PWA installs and runs offline (when applicable)
   - Responsive layout at 320px, 768px, 1440px breakpoints

5. **Write or update tests** in `tests/test-core.js` if your change adds new logic.

6. **Commit** using Conventional Commits format:

   ```bash
   git commit -m "feat: your change description"
   ```

7. **Push and open a PR:**

   ```bash
   git push -u origin feat/your-feature-name
   ```

8. In your PR description, include:
   - What the change does
   - How to test it
   - Any related issues (closes #N)

## Reporting Issues

### Bug Reports

Open a GitHub issue and include:

- A clear, descriptive title
- Steps to reproduce (with screenshots if helpful)
- Expected vs actual behavior
- Browser and OS version
- Whether the bug reproduces in both light and dark themes

### Security Issues

Do **not** open a public issue for security vulnerabilities. Email the maintainers directly or open a draft security advisory on GitHub.

## Feature Requests

Open a GitHub issue with:

- A clear title and description of the proposed feature
- The problem it solves or the use case it addresses
- Any design considerations (theming, i18n, responsiveness)
- Whether it affects cycle tracking, the diary, learning, or other areas

## i18n Guidelines

The app supports three languages: **Serbian** (`sr`), **Simplified Chinese** (`zh-CN`), and **English** (`en`). When adding new UI text:

1. Add translations for **all three languages** in `js/i18n.js`
2. Keep translation keys organized by feature section
3. For cultural content involving Chinese or Serbian holidays, provide brief explanatory notes

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
