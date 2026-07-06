# Contributing Guidelines

First off, thank you for contributing to OpenMaps! By standardizing our engineering workflows, we ensure that a team of 10+ maintainers can collaborate without code conflict or breaking the main builds.

---

## Branching Strategy

Our `main` branch is protected and cannot be pushed to directly. All developer changes must flow through Pull Requests.

### 1. Branch Naming Conventions
Create local branches using descriptive prefixes followed by a short description:
* `feat/` for new client features (e.g., `feat/map-layer-switch`)
* `fix/` for bug fixes (e.g., `fix/nan-coordinate-crash`)
* `docs/` for updates to markdown guides or comments (e.g., `docs/add-api-specs`)
* `infra/` or `chore/` for workflows, configurations, or updates (e.g., `infra/ci-cd-pipeline`)

### 2. PR Review Requirements
* Pull Requests targeting `main` require **at least 1 review approval** from a designated code owner.
* All status checks (linter, tests, and build) must pass successfully before a merge can be completed.

---

## CI/CD and Linting Pipeline

We enforce code quality gates at two levels: local pre-commit and remote CI.

### 1. Pre-Commit Verification (Husky & lint-staged)
On commit attempts, Husky executes `lint-staged` locally:
* Any staged files matching `src/**/*.{js,jsx}` will automatically run `eslint --fix` and `prettier --write`.
* If a lint error cannot be fixed automatically (e.g. unused variables, syntax errors), the commit will be aborted. Developers must address the error before committing again.

### 2. GitHub Actions Gateways
Every Pull Request triggers the CI workflow defined in [.github/workflows/ci.yml](file:///c:/Users/user/Documents/GitHub/openmap/.github/workflows/ci.yml):
* It spins up an Ubuntu environment, setups Node.js, and installs clean dependencies (`npm ci`).
* It executes `npm run lint` and `npm run build`.
* Merges are blocked if any of these checks fail.

### 3. Local Testing Procedures
Before pushing code or creating a commit, developers must run the local verification suite:
```bash
npm run test:local
```
This script runs the syntax linter (`eslint`), compiles the production build to verify no import paths or build issues exist, and then starts a local preview server of the bundled output. This ensures that only verified, deployable code is proposed.

---

## Known System Limitations

We believe in being brutally transparent about the limits of the current architecture. Contributors should keep these in mind when designing upgrades:

* **IndexedDB Storage Restrictions:** Under extreme storage conditions or mobile disk pressure, the browser may evict IndexedDB databases. While `localforage` is highly resilient, developers must assume offline state is volatile and not a replacement for a remote database.
* **Offline Conflict Resolution:** The sync engine uses a sequential FIFO queue. If a place is edited/deleted on one device offline and simultaneously modified on another device, the sync engine processes whichever updates hit the online backend first. There is no current split-merge conflict resolution panel.
* **Nominatim Rate Limits:** Nominatim is a public service. Its usage policy strictly enforces **1 request per second max**. Any feature implementing search autocomplete or rapid typing updates must throttle key presses to respect this threshold.
* **Google OAuth Redirect Loops:** Because authentication redirects users back to `window.location.origin`, if a user logs in while viewing a deep map coordinate URL, the application state resets to default coordinates after redirect completion.
