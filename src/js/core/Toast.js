/* ═══════════════════════════════════════════════════════════════
   Toast — Notification system with queue support
   Usage: Toast.show('Feature added!')
          Toast.show('Error!', 'error')
   ═══════════════════════════════════════════════════════════════ */
const Toast = {
  _container: null,
  _queue: [],
  _maxVisible: 3,

  init() {
    this._container = document.getElementById('toastContainer');
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.className = 'toast-container';
      this._container.id = 'toastContainer';
      document.body.appendChild(this._container);
    }
  },

  show(message, type = 'success', duration = 2500) {
    if (!this._container) this.init();

    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;

    if (type === 'error') {
      el.style.background = 'linear-gradient(135deg, #ef4444, #be185d)';
    } else if (type === 'warning') {
      el.style.background = 'linear-gradient(135deg, #f97316, #eab308)';
    } else if (type === 'info') {
      el.style.background = 'linear-gradient(135deg, #3b82f6, #6366f1)';
    }

    this._container.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });

    // Auto-remove
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => el.remove(), 400);
    }, duration);
  }
};
