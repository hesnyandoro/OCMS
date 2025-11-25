import daisyui from "daisyui";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode Colors (Estate Green Theme)
        'estate-green': {
          DEFAULT: '#1B4332',
          50: '#F1F8F4',
          100: '#D8EFE3',
          200: '#95D5B2',
          300: '#74C69D',
          400: '#52B788',
          500: '#40916C',
          600: '#2D6A4F',
          700: '#1B4332',
          800: '#081C15',
        },
        'harvest-gold': {
          DEFAULT: '#F59E0B',
          50: '#FEF3C7',
          100: '#FDE68A',
          200: '#FCD34D',
          300: '#FBBF24',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
        },
        
        // Dark Mode Colors (Complementary to Estate Green)
        'dark-bg-primary': '#0F1419',      // Deep charcoal - main background
        'dark-bg-secondary': '#1A1F26',    // Slightly lighter - cards/panels
        'dark-bg-tertiary': '#242B35',     // Elevated elements - dropdowns/modals
        'dark-bg-hover': '#2D3541',        // Hover states
        
        'dark-green-primary': '#52B788',   // Muted Estate Green - primary actions
        'dark-green-secondary': '#40916C', // Darker muted green - secondary actions
        'dark-green-hover': '#74C69D',     // Lighter for hover
        'dark-green-muted': '#2D6A4F',     // Very muted for borders/dividers
        'dark-green-subtle': '#1B4332',    // Subtle accents
        
        'dark-gold-primary': '#FBBF24',    // Softer gold for dark mode
        'dark-gold-secondary': '#F59E0B',  // Standard gold
        'dark-gold-muted': '#D97706',      // Darker for accents
        
        'dark-text-primary': '#E8EAED',    // High contrast white - headings/important
        'dark-text-secondary': '#B8BCC3',  // Medium contrast - body text
        'dark-text-tertiary': '#868B94',   // Low contrast - labels/hints
        'dark-text-muted': '#5F6368',      // Very low - disabled/placeholders
        
        'dark-border-primary': '#2D3541',  // Standard borders
        'dark-border-secondary': '#3A4352', // Elevated borders
        'dark-border-focus': '#52B788',    // Focus rings
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke',
      },
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: ["light", "dark", "acid"],
  },
}