---
slug: cosmic-ui-upgrade
title: Cosmic Web Application Upgrade
authors: [anton]
tags: [maintenance]
---
The [commit](https://github.com/grauds/clematis.cosmic.ui/commit/fd7cc51a940e6ac648c9035042b79bc3844f860b)
[upgrades the application to React 19.2](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#breaking-changes) and refreshes the surrounding toolchain to newer compatible versions, including React DOM, Redux Toolkit, Vite, TypeScript, ESLint, and Vitest.
It also moves the routing stack from the older React Router line to v7, which brings API and behavior changes in navigation and route handling.
The build and CI environment are updated as well, with the pipeline switching to Node 22 and the dependency graph modernized to match newer package requirements.
