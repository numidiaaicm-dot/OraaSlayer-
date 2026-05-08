/**
 * OraaSlayer Download Page
 */
export default async function Download(ctx) {
  const { root, go, onCleanup } = ctx;
  const cleanup = [];

  document.title = 'OraaSlayer | تحميل التطبيق';
  window.scrollTo({ top: 0, behavior: 'instant' });

  root.innerHTML = `
<style>
  .download-container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }
  .download-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--gold);
  }
  .download-content {
    background: var(--panel);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--border);
  }
</style>
<div class="download-container">
  <h1 class="download-title">تحميل التطبيق</h1>
  <div class="download-content">
    <p>التطبيق متاح قريباً على المتاجر.</p>
    <p>App available soon on stores.</p>
  </div>
</div>
  `;

  onCleanup(() => {
    cleanup.forEach(fn => fn());
  });
}