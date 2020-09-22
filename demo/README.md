# Demo

A small app that renders the components with sample tournament data. It builds against `../src` directly, so it always
shows the code in this repository rather than the package published on npm.

## Run it

Install the library's dependencies as well, since the source imported from `../src` resolves them from the repository
root:

```
npm ci            # in the repository root
cd demo
npm ci
npm run dev
```

## Scripts

| Script              | Purpose                                                      |
|---------------------|--------------------------------------------------------------|
| `npm run dev`       | Start the development server                                 |
| `npm run typecheck` | Type-check the demo along with the library source it imports |
| `npm run build`     | Type-check, then write a production build to `dist/`         |
| `npm run preview`   | Serve the production build locally                           |
| `npm run smoke`     | Load the production build in Chrome and check that it works  |

The smoke test drives the Chrome installed on your machine, so it needs a local copy of Chrome and a prior
`npm run build`.
