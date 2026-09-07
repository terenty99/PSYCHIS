/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'white-pure': '#FFFFFF',
        'white-warm': '#F8F7F5',
        'white-subtle': '#F5F4F2',
        'grey-soft': '#F0EFED',
        'grey-medium': '#E8E6E3',
        'grey-deep': '#E0DED9',
        'grey-accent': '#D8D6D2',
        'grey-strong': '#C5C2BC',
        'text-primary': '#4A4540',
        'text-secondary': '#6B655A',
        'text-muted': '#8A8782',
        'text-faint': '#B0ADA8',
        'obsidian-bg': 'rgba(15, 18, 26, 0.96)',
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
