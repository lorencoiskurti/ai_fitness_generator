import { Link } from 'react-router-dom';

interface MobileNavProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  subscriptionActive: boolean;
  username?: string;
  currentPath: string;
  onGoToPro: (path: string) => void;
  onLogout: () => void;
  onLinkClick: () => void;
}

export default function MobileNav({
  isOpen,
  isAuthenticated,
  subscriptionActive,
  username,
  currentPath,
  onGoToPro,
  onLogout,
  onLinkClick
}: MobileNavProps) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-black/50 dark:bg-black/70 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onLinkClick}
    >
      <nav
        className={`fixed right-0 top-16 w-64 bg-white dark:bg-slate-900 shadow-lg dark:shadow-slate-700 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 mb-4">
                {username}
              </div>
              <Link
                to="/"
                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                onClick={onLinkClick}
              >
                Home
              </Link>
              <Link
                to="/plans"
                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                onClick={onLinkClick}
              >
                My Plans
              </Link>
              <Link
                to="/generate"
                className="block px-4 py-2 rounded-lg bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium"
                onClick={onLinkClick}
              >
                Generate Plan
              </Link>
              {subscriptionActive ? (
                <Link
                  to="/subscription"
                  className="block px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  onClick={onLinkClick}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Pro Active</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    onGoToPro(currentPath);
                    onLinkClick();
                  }}
                  className="w-full block px-4 py-2 rounded-lg text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors font-medium text-center"
                >
                  Go Pro
                </button>
              )}
              <button
                onClick={() => {
                  onLogout();
                  onLinkClick();
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                onClick={onLinkClick}
              >
                Home
              </Link>
              <Link
                to="/login"
                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                onClick={onLinkClick}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 rounded-lg bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium"
                onClick={onLinkClick}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
