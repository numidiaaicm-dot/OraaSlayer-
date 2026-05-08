/**
 * OraaSlayer Settings Page
 */
export default async function Settings(ctx) {
  const { root, go, onCleanup } = ctx;
  const cleanup = [];

  document.title = 'OraaSlayer | الإعدادات';
  window.scrollTo({ top: 0, behavior: 'instant' });

  root.innerHTML = `
<style>
  .settings-container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }
  .settings-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--gold);
    text-align: center;
  }
  .settings-content {
    background: var(--panel);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--border);
  }
</style>
<div class="settings-container">
  <h1 class="settings-title">الإعدادات</h1>
  <div class="settings-content">
    <p>إعدادات الحساب قيد التطوير.</p>
    <p>Account settings under development.</p>
  </div>
</div>
  `;

  onCleanup(() => {
    cleanup.forEach(fn => fn());
  });
}