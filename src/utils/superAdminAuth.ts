/**
 * App Super Admin (System / Developer Owner) Authentication Utility
 * 
 * Provides strict role isolation:
 * - App Super Admin: Only account with permission to generate license keys,
 *   manage client devices, execute remote cloud unlocks, and access the master key vault.
 * - Store Users (Bakery Owners & Staff): Have permissions restricted to managing
 *   their individual bakery/store operations only (POS, Inventory, Sales, Expenses, etc.).
 *   They do NOT have any access to the key generator or master keys.
 */

const STORAGE_SUPER_ADMIN_SESSION = 'bakery_super_admin_authenticated';
const SUPER_ADMIN_EVENT = 'bakery_super_admin_auth_changed';

// Master Secret PINs / Passwords for App Super Admin
export const SUPER_ADMIN_MASTER_PINS = ['889977', '999999', 'admin@bakery2026'];

/**
 * Checks if the current user is authenticated as App Super Admin
 */
export const isSuperAdminAuthenticated = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_SUPER_ADMIN_SESSION) === 'true';
  } catch (e) {
    return false;
  }
};

/**
 * Authenticates user as App Super Admin using Master PIN or Password
 */
export const authenticateSuperAdmin = (
  inputPinOrSecret: string
): { success: boolean; message: string } => {
  const cleanInput = inputPinOrSecret.trim();

  if (!cleanInput) {
    return { success: false, message: 'សូមបញ្ចូល Master PIN ឬពាក្យសម្ងាត់ Super Admin' };
  }

  if (SUPER_ADMIN_MASTER_PINS.includes(cleanInput)) {
    try {
      localStorage.setItem(STORAGE_SUPER_ADMIN_SESSION, 'true');
      window.dispatchEvent(new Event(SUPER_ADMIN_EVENT));
    } catch (e) {}

    return {
      success: true,
      message: 'ជោគជ័យ! បានចូលជា App Super Admin (Master License Manager)',
    };
  }

  return {
    success: false,
    message: 'Master PIN ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ (Access Denied)!',
  };
};

/**
 * Logs out / De-authenticates App Super Admin
 */
export const deauthenticateSuperAdmin = (): void => {
  try {
    localStorage.removeItem(STORAGE_SUPER_ADMIN_SESSION);
    window.dispatchEvent(new Event(SUPER_ADMIN_EVENT));
  } catch (e) {}
};

/**
 * Subscribes to changes in Super Admin authentication status
 */
export const onSuperAdminAuthChange = (
  callback: (isAuthenticated: boolean) => void
): (() => void) => {
  const handler = () => {
    callback(isSuperAdminAuthenticated());
  };

  window.addEventListener(SUPER_ADMIN_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(SUPER_ADMIN_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};
