# Contributing to Openmaps

First off, thanks for taking the time to contribute!
Every contribution — big or small — is genuinely appreciated.

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started Locally](#getting-started-locally)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows a simple rule: **be respectful.**  
We welcome contributors of all experience levels. No question is too basic,
no bug report is too small. Discrimination, harassment, or gatekeeping of
any kind will not be tolerated.

---

## How Can I Contribute?

There are several ways to contribute, even without writing code:

- Star the repository (helps with visibility)
- Report bugs via GitHub Issues
- Suggest new features via GitHub Issues
- Improve documentation or fix typos in the README
- Submit code fixes or new features via Pull Requests
- Help translate the app into other languages

---

## Getting Started Locally

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- A free Supabase account

### Setup

1. **Fork the repository**
   Click the "Fork" button at the top right of the GitHub repo page.

2. **Clone your fork**
   git clone https://github.com/YOUR_USERNAME/maps-clone.git
cd maps-clone

3. **Install dependencies**
npm install

4. **Set up environment variables**
   Create a `.env` file in the root directory:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

5. **Run locally**
npm run dev
   App will be running at `http://localhost:5173`

---

## Pull Request Process

1. **Create a branch** for your change — never commit directly to `main`:
git checkout -b feature/your-feature-name
   Use prefixes like:
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation changes
   - `style/` for CSS/UI changes

2. **Make your changes** and test them locally

3. **Commit with a clear message:**
git commit -m "feat: add directions between two points"
   Follow this commit message format:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation change
   - `style:` — formatting, CSS changes
   - `refactor:` — code restructure, no feature change

4. **Push to your fork:**
git push origin feature/your-feature-name

5. **Open a Pull Request** on GitHub — describe what you changed and why

6. A maintainer will review your PR within a few days. We may ask for changes before merging.

---

##  Style Guidelines

### Code
- Use **React functional components** with hooks — no class components
- Keep components **small and focused** — one job per component
- Use **meaningful variable names** — `userLocation` not `ul`
- Always handle **loading and error states** in async operations

### CSS
- All styles go in `App.css` — no inline styles unless unavoidable
- Use **class names** that describe the element's purpose, not its appearance
  - ✅ `.sidebar-toggle`
  - ❌ `.red-round-button`

### File Structure
src/
├── App.jsx          ← main layout, map logic
├── App.css          ← all styles
├── SearchBar.jsx    ← search functionality
├── Sidebar.jsx      ← sidebar + saved places
├── AuthButton.jsx   ← Google auth
├── LocateButton.jsx ← geolocation
└── supabaseClient.js← Supabase init

---

## Reporting Bugs

Found a bug? Please open a **GitHub Issue** and include:

- **What you expected to happen**
- **What actually happened**
- **Steps to reproduce it**
- **Your browser and OS** (e.g. Chrome 120 on Windows 11)
- **Screenshots** if relevant

Use this template:
Bug description:
[Clear description of the bug]
Steps to reproduce:

Go to '...'
Click on '...'
See error

Expected behaviour:
[What should have happened]
Actual behaviour:
[What actually happened]
Environment:

Browser: Chrome 120
OS: Windows 11
App version: 1.0.0


---

## Suggesting Features

Have an idea? Open a **GitHub Issue** with the label `enhancement` and include:

- **What problem does this solve?**
- **How would it work?**
- **Who would benefit from it?**

Current planned features (good for first contributions):
- [ ] Routing/directions between two points (OSRM)
- [ ] Click-to-drop-pin anywhere on the map
- [ ] Map style switcher (street, satellite, dark mode)
- [ ] Search autocomplete/suggestions
- [ ] Share a saved place via link

---

## 📄 License

By contributing to MapClone, you agree that your contributions will be
licensed under the same **MIT License** that covers the project.

---

*Thank you for helping make Openmaps better for everyone! 🌍*
Commit it.
