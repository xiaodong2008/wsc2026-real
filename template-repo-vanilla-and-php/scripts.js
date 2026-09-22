// Vanilla JavaScript — no framework, no bundler. Loaded directly by index.html.

const API = 'api/tasks.php'

const list = document.getElementById('tasks')
const form = document.getElementById('add-task')
const title = document.getElementById('title')

/** Render an array of tasks into the list, replacing whatever is there. */
function render(tasks) {
  list.replaceChildren(
    ...tasks.map(task => {
      const li = document.createElement('li')
      li.textContent = `${task.done ? '✅' : '⬜️'} ${task.title}`
      return li
    }),
  )
}

function showError(message) {
  const li = document.createElement('li')
  li.className = 'warn'
  li.textContent = `⚠️ ${message}`
  list.replaceChildren(li)
}

async function load() {
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(`request failed (${res.status})`)
    const data = await res.json()
    render(data.tasks)
  } catch (err) {
    showError(`Could not load tasks: ${err.message}`)
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault()
  const value = title.value.trim()
  if (!value) return

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: value }),
    })
    if (!res.ok) throw new Error(`request failed (${res.status})`)
    title.value = ''
    await load()
  } catch (err) {
    showError(`Could not add the task: ${err.message}`)
  }
})

load()
