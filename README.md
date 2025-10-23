# Lago Documentation

The Lago documentation is available at [doc.getlago.com](https://doc.getlago.com/docs/api/intro).

## Current Releases

| Project            | Release Badge                                                                                       |
|--------------------|-----------------------------------------------------------------------------------------------------|
| **Lago**           | [![Lago Release](https://img.shields.io/github/v/release/getlago/lago)](https://github.com/getlago/lago/releases) |
| **Lago OpenAPI**     | [![Lago OpenAPI Release](https://img.shields.io/github/v/release/getlago/lago-openapi)](https://github.com/getlago/lago-openapi/releases) |

## Running locally

:warning: You need to install [mise](https://mise.jdx.dev/installing-mise.html).
When mise is installed : you should run `mise install`

```shell
pnpm install
pnpm run dev
```

Noticed that the production `openapi` spec file is linked in the `docs.json`. Locally, you can update this value
to test with your local file but **make sure you don't commit this change**. It's recommended to create a symlink
at the root of the folder, I had issues when using `../`.

```shell
ln -s ../lago-openapi/openapi.yaml
```

```diff
  "api": {
-    "openapi": "https://swagger.getlago.com/openapi.yaml",
+    "openapi": "openapi.yaml",
    "mdx": {
```
