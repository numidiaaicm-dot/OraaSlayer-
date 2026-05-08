/**
 * OraaSlayer About Page
 */
export default async function About(ctx) {
  const { root, go, onCleanup } = ctx;
  const cleanup = [];

  document.title = 'OraaSlayer | عن المنصة';
  window.scrollTo({ top: 0, behavior: 'instant' });

  root.innerHTML = `
<style>
  .about-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  .about-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--gold);
    text-align: center;
  }
  .about-content {
    background: var(--panel);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--border);
    line-height: 1.6;
  }
</style>
<div class="about-container">
  <h1 class="about-title">عن OraaSlayer</h1>
  <div class="about-content">
    <p>OraaSlayer هي المنصة العربية الأولى للأنمي، تقدم تجربة مشاهدة مميزة ومجتمع نشط.</p>
    <p>OraaSlayer is the first Arabic anime platform, offering a unique viewing experience and an active community.</p>
  </div>
</div>
  `;

  onCleanup(() => {
    cleanup.forEach(fn => fn());
  });
}