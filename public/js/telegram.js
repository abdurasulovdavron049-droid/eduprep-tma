/**
 * Telegram WebApp Integration Layer
 * Safely handles WebApp SDK, user info, haptics, and fallback in regular browsers.
 */

const tg = window.Telegram?.WebApp;

const TelegramApp = {
  isAvailable: false,
  user: null,

  init() {
    if (tg && tg.initData) {
      this.isAvailable = true;
      try {
        tg.ready();
        tg.expand();
        
        // Apply Telegram theme classes if available
        if (tg.colorScheme === 'light') {
          document.body.classList.remove('theme-dark');
          document.body.classList.add('theme-light');
        } else {
          document.body.classList.add('theme-dark');
        }

        // Get User details
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          this.user = tg.initDataUnsafe.user;
          this.applyUserData();
        }
      } catch (err) {
        console.warn('Telegram WebApp init error:', err);
      }
    } else {
      console.log('Running in standalone browser mode (Telegram SDK simulated)');
      this.applyFallbackUser();
    }
  },

  applyUserData() {
    if (!this.user) return;
    const fullName = `${this.user.first_name || ''} ${this.user.last_name || ''}`.trim() || 'Foydalanuvchi';
    const initial = (this.user.first_name || 'U').charAt(0).toUpperCase();

    // Update all name elements safely
    const nameEls = [
      document.getElementById('sidebar-name'),
      document.getElementById('dash-username'),
      document.getElementById('user-name')
    ];
    nameEls.forEach(el => {
      if (el) el.innerText = fullName;
    });

    // Update avatar elements safely
    const avatarEls = [
      document.getElementById('sidebar-avatar'),
      document.getElementById('user-avatar')
    ];
    avatarEls.forEach(el => {
      if (el) el.innerText = initial;
    });

    // Greeting message
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) greetingEl.innerText = 'Xayrli tong!';
      else if (hour >= 12 && hour < 18) greetingEl.innerText = 'Xayrli kun!';
      else greetingEl.innerText = 'Xayrli oqshom!';
    }
  },

  applyFallbackUser() {
    const nameEl = document.getElementById('sidebar-name') || document.getElementById('dash-username') || document.getElementById('user-name');
    if (nameEl && (nameEl.innerText === 'Foydalanuvchi' || !nameEl.innerText)) {
      nameEl.innerText = 'Davronjon';
    }
  },

  // Haptic feedback triggers
  haptic(type = 'light') {
    if (!this.isAvailable || !tg.HapticFeedback) return;
    try {
      if (type === 'light' || type === 'medium' || type === 'heavy') {
        tg.HapticFeedback.impactOccurred(type);
      } else if (type === 'success' || type === 'error' || type === 'warning') {
        tg.HapticFeedback.notificationOccurred(type);
      } else if (type === 'selection') {
        tg.HapticFeedback.selectionChanged();
      }
    } catch (e) {
      console.debug('Haptics failed', e);
    }
  },

  // MainButton control
  showMainButton(text, callback) {
    if (!this.isAvailable || !tg.MainButton) return;
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(callback);
  },

  hideMainButton() {
    if (!this.isAvailable || !tg.MainButton) return;
    tg.MainButton.hide();
  }
};

window.TelegramApp = TelegramApp;
