/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'white-pure': 'var(--white-pure)',
        'white-warm': 'var(--white-warm)',
        'white-subtle': 'var(--white-subtle)',
        'grey-soft': 'var(--grey-soft)',
        'grey-medium': 'var(--grey-medium)',
        'grey-deep': 'var(--grey-deep)',
        'grey-accent': 'var(--grey-accent)',
        'grey-strong': 'var(--grey-strong)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-faint': 'var(--text-faint)',
        'obsidian-bg': 'var(--obsidian-bg)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'linkage-pulse': 'linkagePulse 6s ease-in-out infinite',
        'chip-drift': 'chipDrift 4s ease-in-out infinite',
        'ping-slow': 'pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        linkagePulse: {
          '0%, 100%': { strokeOpacity: '0.18' },
          '50%': { strokeOpacity: '0.35' },
        },
        chipDrift: {
          '0%, 100%': { transform: 'translate(-50%, -50%) translateY(0)' },
          '50%': { transform: 'translate(-50%, -50%) translateY(-2px) scale(1.01)' },
        },
        pingSlow: {
          '0%, 75%': { transform: 'scale(0.8)', opacity: '0.4' },
          '76%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
