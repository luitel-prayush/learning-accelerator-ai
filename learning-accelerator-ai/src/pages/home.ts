export function HomePage() {
  return `
    <section class="space-y-6">
      <fast-card class="p-6">
        <h1 class="text-2xl font-semibold">Welcome to Learning Accelerator</h1>
        <p class="mt-2 text-neutral-600 dark:text-neutral-300">
          Choose a topic, get a personalized path, and master it faster with adaptive quizzes and spaced repetition.
        </p>
        <div class="mt-4 flex gap-2">
          <fast-text-field id="topic-input" placeholder="e.g., Linear Algebra, Docker, TypeScript"></fast-text-field>
          <fast-button id="start-learning">Start Learning</fast-button>
        </div>
      </fast-card>
    </section>
  `;
}
