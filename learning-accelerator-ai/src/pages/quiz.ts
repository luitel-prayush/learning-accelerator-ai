export function QuizPage() {
  return `
    <section class="space-y-6">
      <fast-card class="p-6">
        <h2 class="text-xl font-semibold">Adaptive Quiz</h2>
        <p class="mt-2 text-neutral-600 dark:text-neutral-300">Questions will adapt to your performance.</p>
        <div class="mt-4 space-y-3">
          <div>
            <div class="mb-2">Sample question placeholder</div>
            <fast-text-field placeholder="Type your answer..."></fast-text-field>
          </div>
          <div class="flex gap-2">
            <fast-button id="submit-answer" appearance="accent">Submit</fast-button>
            <fast-button id="skip-question" appearance="outline">Skip</fast-button>
          </div>
        </div>
      </fast-card>
    </section>
  `;
}
