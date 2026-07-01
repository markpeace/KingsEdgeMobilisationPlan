# Deployment Notes

The site is built as a static Vite application and should be straightforward to deploy through GitHub Pages, Netlify or Vercel.

## GitHub Pages

The current Vite config sets the production base path to:

```text
/KingsEdgeMobilisationPlan/
```

This is suitable for GitHub Pages deployment from the repository name.

A later step can add a GitHub Actions workflow that:

1. Installs dependencies
2. Runs `npm run build`
3. Publishes the `dist/` folder to GitHub Pages

## Netlify or Vercel

For Netlify or Vercel, the project should build with:

```bash
npm run build
```

Output directory:

```text
dist
```

If deploying outside GitHub Pages, the Vite base path may need to be changed to `/`.
