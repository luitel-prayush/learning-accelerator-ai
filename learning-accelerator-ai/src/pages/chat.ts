export function ChatPage() {
  return `
    <section class="space-y-6">
      <fast-card class="p-6">
        <h2 class="text-xl font-semibold">Chat</h2>
        <p class="mt-2 text-neutral-600 dark:text-neutral-300">Ask questions about your topic or anything you're learning.</p>
        <div class="mt-4 flex flex-col gap-3">
          <div id="chat-log" class="min-h-[200px] max-h-[420px] overflow-auto border border-neutral-200/70 dark:border-neutral-800/70 rounded p-3 space-y-2 bg-neutral-50 dark:bg-neutral-900"></div>
          <div class="flex gap-2 items-center">
            <fast-text-field id="chat-input" class="flex-1" placeholder="Type a message..."></fast-text-field>
            <fast-button id="chat-send" appearance="accent">Send</fast-button>
          </div>
        </div>
      </fast-card>
    </section>
  `;
}
