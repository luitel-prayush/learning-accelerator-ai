export function ProgressPage() {
  return `
    <section class="space-y-6">
      <fast-card class="p-6">
        <h2 class="text-xl font-semibold">Progress</h2>
        <p class="mt-2 text-neutral-600 dark:text-neutral-300">Track your learning time, mastery, and review schedule.</p>
        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <fast-card class="p-4">Mastery: 0%</fast-card>
          <fast-card class="p-4">Reviews due: 0</fast-card>
        </div>
      </fast-card>
    </section>
  `;
}
