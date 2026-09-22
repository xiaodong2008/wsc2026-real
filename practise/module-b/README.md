# Vue 3.5.28 — WSC2026

A small, real **Vue** application (version **3.5.28**), part of the WorldSkills 2026
Web Technologies (TP17) set. Runtime pinned to the competition spec.

## Run it

```bash
docker compose up --build
```

Then open **http://localhost**. This starts the app's dev server inside Docker — no local
toolchain required.

Stop it with `docker compose down`.

## Develop

For a hot-reloading loop on your machine you need **Node 24.1.0** and **npm 11.5.0** installed locally (the same versions the Docker image pins).

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost** and reloads on save.
Edit **src/App.vue** to change the app.

## Stack

- Node 24.1.0 / npm 11.5.0
- Vue 3.5.28
