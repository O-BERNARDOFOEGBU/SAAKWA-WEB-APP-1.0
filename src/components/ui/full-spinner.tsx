import React from "react";

/**
 * FullPageLoader
 * A full-screen animated loading spinner using Tailwind CSS.
 * Covers the entire page with a smooth fade-in overlay and a centered spinner.
 */
export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fadeIn">
      <div className="h-16 w-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );
}

/* Tailwind CSS custom animation (add to tailwind.config.js if needed)

module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
};

USAGE:

import FullPageLoader from './FullPageLoader';

function Page() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <FullPageLoader />}
      <main>Your content...</main>
    </>
  );
}
*/
