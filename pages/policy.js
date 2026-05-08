/**
 * OraaSlayer Privacy Policy Page
 */
export default async function Policy(ctx) {
  const { root, go, onCleanup } = ctx;
  const cleanup = [];

  document.title = 'OraaSlayer | سياسة الخصوصية';
  window.scrollTo({ top: 0, behavior: 'instant' });

  root.innerHTML = `
<style>
  .policy-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  .policy-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--gold);
    text-align: center;
  }
  .policy-content {
    background: var(--panel);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--border);
    line-height: 1.6;
  }
</style>
<div class="policy-container">
  <h1 class="policy-title">سياسة الخصوصية</h1>
  <div class="policy-content">
    <p>نحن في OraaSlayer نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
    <p>At OraaSlayer, we respect your privacy and are committed to protecting your personal data.</p>
    <p>سياسة الخصوصية الكاملة قيد التطوير.</p>
    <p>Full privacy policy under development.</p>
  </div>
</div>
  `;

  onCleanup(() => {
    cleanup.forEach(fn => fn());
  });
}