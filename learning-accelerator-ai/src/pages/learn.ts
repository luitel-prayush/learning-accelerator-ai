export function LearnPage() {
  return `
    <section class="space-y-6">
      <fast-card class="p-6">
        <h2 class="text-xl font-semibold">Learning Path</h2>
        <p class="mt-2 text-neutral-600 dark:text-neutral-300">Your personalized modules will appear here.</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <fast-card class="p-4">Module 1</fast-card>
          <fast-card class="p-4">Module 2</fast-card>
        </div>
      </fast-card>
    </section>
  `;
}
