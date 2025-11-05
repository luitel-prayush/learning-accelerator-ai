export function TopicsPage() {
  return `
    <section class="space-y-6">
      <fast-card class="p-6">
        <h2 class="text-xl font-semibold">Topics</h2>
        <p class="mt-2 text-neutral-600 dark:text-neutral-300">Saved topics will appear below.</p>
        <div id="topics-list" class="mt-4 grid gap-3 sm:grid-cols-2"></div>
      </fast-card>
    </section>
  `;
}
