# DSA Cheat Sheet

A clean, interactive quick-reference for algorithms and data structures.

**Live site:** [https://your-username.github.io/dsa-cheat-sheet/](https://your-username.github.io/dsa-cheat-sheet/)

## What's inside

- **Identify the Algorithm** — Signal words and patterns that map problems to algorithms
- **Decision Tree** — Step-by-step quiz to find the right algorithm
- **Learn Each Algorithm** — Analogies, memory hooks, when to use / when to avoid
- **Quick Compare** — Side-by-side table of all algorithms
- **Python Code** — Copy-paste ready implementations with examples

## Local development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. **Create a repo** on GitHub named `dsa-cheat-sheet`
2. **Push this code** to the `main` branch
3. **Go to Settings → Pages** in your repo
4. **Set Source** to "GitHub Actions"
5. The workflow in `.github/workflows/deploy.yml` will build and deploy automatically on every push to `main`

### If you use a different repo name

Edit `vite.config.js` and change the `base` path:

```js
base: '/your-repo-name/',
```

If you use a custom domain, set it to:

```js
base: '/',
```

## Tech stack

- React 18
- Vite
- No external UI libraries — pure inline styles for zero dependency weight
