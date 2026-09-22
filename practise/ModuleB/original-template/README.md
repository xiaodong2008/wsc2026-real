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

## Tailwind CSS

Tailwind **4.1.18** is installed and wired up, but nothing in the template uses it — it is here
for you to reach for if you want it, and it costs nothing if you don't. Add utility classes to
your markup and they work straight away:

```html
<div class="rounded-xl bg-slate-800 p-6 text-slate-100">…</div>
```

`@tailwindcss/vite` is registered in `vite.config.js`. The entry stylesheet is
`src/style.css`, imported from `src/main.js`; the app's own global styles stay in `App.vue`.

The template's own CSS lives inside Tailwind's `base` layer, and that detail matters: unlayered
CSS outranks *every* cascade layer, so left as it was a rule like `button { background: … }`
would silently beat `class="bg-blue-500"` and the class would appear to do nothing. Inside
`base` those rules still style unclassed elements, while utilities override them as expected.

Tailwind 4 needs no `tailwind.config.js` — it is configured in CSS. Customise the theme with
`@theme { … }` in `src/style.css`. Docs: <https://tailwindcss.com/docs>

## Stack

- Node 24.1.0 / npm 11.5.0
- Vue 3.5.28
- Tailwind CSS 4.1.18 — installed and configured, use it or ignore it
