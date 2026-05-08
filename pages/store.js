/**
 * OraaSlayer Store Page
 */
export default async function Store(ctx) {
  const { root, go, onCleanup } = ctx;
  const cleanup = [];

  document.title = 'OraaSlayer | المتجر';
  window.scrollTo({ top: 0, behavior: 'instant' });

  root.innerHTML = `
<style>
  .store-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  .store-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--gold);
    text-align: center;
  }
  .store-content {
    background: var(--panel);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--border);
    text-align: center;
  }
</style>
<div class="store-container">
  <h1 class="store-title">متجر OraaSlayer</h1>
  <div class="store-content">
    <p>المتجر قيد التطوير. سيتم إضافة العناصر والمميزات قريباً.</p>
    <p>Store under development. Items and features will be added soon.</p>
  </div>
</div>
  `;

  onCleanup(() => {
    cleanup.forEach(fn => fn());
  });
}