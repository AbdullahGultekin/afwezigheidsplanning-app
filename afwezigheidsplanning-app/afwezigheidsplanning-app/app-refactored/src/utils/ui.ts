// UI utility functions

export function showModal(html: string): void {
  const modalBody = document.getElementById('modal-body');
  const modal = document.getElementById('modal');
  if (modalBody) modalBody.innerHTML = html;
  if (modal) modal.classList.add('active');
}

export function closeModal(): void {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
}

export function showAlert(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  const colors = {
    success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
    error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
    info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' },
  };

  const style = colors[type];
  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.style.cssText = `background: ${style.bg}; color: ${style.color}; border: 1px solid ${style.border}; padding: 12px; border-radius: 4px; margin-bottom: 20px;`;
  alert.textContent = message;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alert, container.firstChild);
    setTimeout(() => alert.remove(), 5000);
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('nl-NL');
}

export function formatCurrency(amount: number): string {
  return `&euro;${amount.toFixed(2)}`;
}

