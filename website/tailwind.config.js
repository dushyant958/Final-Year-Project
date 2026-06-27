/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Lora', 'Georgia', 'serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: '#ff4040',
        o400: '#ff4040',
        dbg: '#09090b',
        ds: '#111114',
        de: '#1a1a1f',
        db: '#2a2a30',
        dh: '#f5f5f5',
        dbd: '#d6d6d6',
        dsc: '#999999',
        dm: '#666666',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
      },
      boxShadow: {
        glow: '0 0 32px rgba(255, 64, 64, 0.3)',
        'glow-hover': '0 0 32px rgba(255, 64, 64, 0.4)',
        dropdown: '0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
