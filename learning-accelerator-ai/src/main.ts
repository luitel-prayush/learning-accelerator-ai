import './style.css';
import { registerFAST } from './fast';
import { initRouter, navigate, registerRoute } from './router';
import { HomePage } from './pages/home';
import { LearnPage } from './pages/learn';
import { QuizPage } from './pages/quiz';
import { ProgressPage } from './pages/progress';
import { TopicsPage } from './pages/topics';

registerFAST();

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="sticky top-0 z-10 border-b border-neutral-200/60 bg-white/80 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/80">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-4">
      <div class="font-semibold tracking-tight">Learning Accelerator</div>
      <nav class="ml-auto flex items-center gap-2">
        <fast-button appearance="accent" id="nav-home">Home</fast-button>
        <fast-button appearance="accent" id="nav-topics">Topics</fast-button>
        <fast-button appearance="accent" id="nav-learn">Learn</fast-button>
        <fast-button appearance="accent" id="nav-quiz">Quiz</fast-button>
        <fast-button appearance="accent" id="nav-progress">Progress</fast-button>
      </nav>
    </div>
  </header>
  <main class="py-6 sm:py-8 lg:py-10">
    <div id="route" class="w-full px-0 sm:px-6"></div>
  </main>
`;

document.getElementById('nav-home')?.addEventListener('click', () => navigate('#/'));
document.getElementById('nav-topics')?.addEventListener('click', () => navigate('#/topics'));
document.getElementById('nav-learn')?.addEventListener('click', () => navigate('#/learn'));
document.getElementById('nav-quiz')?.addEventListener('click', () => navigate('#/quiz'));
document.getElementById('nav-progress')?.addEventListener('click', () => navigate('#/progress'));

// Register routes
registerRoute('#/', () => HomePage(), () => {
  const btn = document.getElementById('start-learning');
  btn?.addEventListener('click', () => {
    const input = document.getElementById('topic-input') as HTMLInputElement | null;
    const topic = (input?.value || '').trim();
    if (topic) localStorage.setItem('la_topic', topic);
    navigate('#/learn');
  });
});

registerRoute('#/learn', () => LearnPage(), async () => {
  const route = document.getElementById('route') as HTMLDivElement;
  const topic = localStorage.getItem('la_topic') || 'General Learning';
  route.querySelector('fast-card')!.innerHTML = `
    <h2 class="text-xl font-semibold">Learning Path</h2>
    <p class="mt-2 text-neutral-600 dark:text-neutral-300">Loading modules for ${topic}...</p>
  `;
  try {
    const res = await fetch(`/api/topics/${encodeURIComponent(topic)}/modules`);
    const data = await res.json();
    const modules = (data.items || []) as Array<{id:number;title:string;duration_min:number}>;
    const cards = modules.map(m => `<fast-card class="p-4"><div class="font-medium">${m.title}</div><div class="text-sm opacity-70">~${m.duration_min} min</div></fast-card>`).join('');
    route.querySelector('fast-card')!.innerHTML = `
      <h2 class="text-xl font-semibold">Learning Path</h2>
      <p class="mt-2 text-neutral-600 dark:text-neutral-300">Topic: ${data.topic}</p>
      <div class="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">${cards}</div>
    `;
  } catch (e) {
    route.querySelector('fast-card')!.innerHTML = `<div class="text-red-600">Failed to load learning path.</div>`;
  }
});
// Topics page: list saved topics and allow selecting one
registerRoute('#/topics', () => TopicsPage(), async () => {
  const list = document.getElementById('topics-list') as HTMLDivElement | null;
  if (!list) return;
  list.innerHTML = `<div>Loading topics...</div>`;
  try {
    const res = await fetch('/api/topics');
    const data = await res.json();
    const items = (data.items || []) as Array<{id:number; name:string}>;
    if (!items.length) {
      list.innerHTML = `<div class="opacity-70">No topics yet. Add one from Home and start learning.</div>`;
      return;
    }
    list.innerHTML = items.map(t => `
      <fast-card class="p-4 flex items-center justify-between">
        <div class="font-medium">${t.name}</div>
        <fast-button appearance="outline" data-topic="${t.name}" class="select-topic">Open</fast-button>
      </fast-card>
    `).join('');
    list.querySelectorAll('.select-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement;
        const name = el.getAttribute('data-topic') || '';
        if (name) {
          localStorage.setItem('la_topic', name);
          navigate('#/learn');
        }
      });
    });
  } catch (e) {
    list.innerHTML = `<div class="text-red-600">Failed to load topics.</div>`;
  }
});

registerRoute('#/quiz', () => QuizPage(), async () => {
  const route = document.getElementById('route') as HTMLDivElement;
  const topic = localStorage.getItem('la_topic') || 'General';
  const container = route.querySelector('fast-card') as HTMLElement;
  container.querySelector('h2')!.insertAdjacentHTML('afterend', `<div class="mt-2 text-neutral-600 dark:text-neutral-300">Topic: ${topic}</div>`);
  try {
    const res = await fetch(`/api/topics/${encodeURIComponent(topic)}/quiz/next`);
    const data = await res.json();
    const q = data.question;
    container.querySelector('div')!.innerHTML = `<div class="mb-2">${q.prompt}</div><fast-text-field id="answer" placeholder="Type your answer..."></fast-text-field>`;

    // Wire submit handler
    const submit = container.querySelector('#submit-answer');
    submit?.addEventListener('click', async () => {
      const input = container.querySelector('#answer') as HTMLInputElement | null;
      const answer = (input?.value || '').trim();
      const resp = await fetch(`/api/topics/${encodeURIComponent(topic)}/quiz/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: q.id, answer }),
      });
      const r = await resp.json();
      const status = r.correct ? `Correct ✅ (score: ${Math.round((r.score ?? 0) * 100)}%)` : 'Recorded ❌';
      container.insertAdjacentHTML('beforeend', `<div class="mt-3">${status}</div>`);
    });
  } catch (e) {
    container.insertAdjacentHTML('beforeend', `<div class="text-red-600 mt-2">Failed to load question.</div>`);
  }
});

registerRoute('#/progress', () => ProgressPage(), async () => {
  const route = document.getElementById('route') as HTMLDivElement;
  try {
    const res = await fetch('/api/progress');
    const data = await res.json();
    const cards = route.querySelectorAll('fast-card');
    if (cards.length >= 3) {
      (cards[1] as HTMLElement).innerHTML = `Mastery: ${(data.mastery * 100).toFixed(0)}%`;
      (cards[2] as HTMLElement).innerHTML = `Reviews due: ${data.reviews_due}`;
    }
  } catch (e) {
    route.querySelector('fast-card')?.insertAdjacentHTML('beforeend', `<div class="text-red-600 mt-2">Failed to load progress.</div>`);
  }
});
registerRoute('#/404', () => `<fast-card class="p-6">Not Found</fast-card>`);

initRouter(document.getElementById('route') as HTMLDivElement);

// Global listeners can go here if needed
