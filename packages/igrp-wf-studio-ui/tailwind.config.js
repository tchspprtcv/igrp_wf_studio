/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // Ajuste para o contexto do monorepo, se os componentes shadcn forem para packages/igrp-wf-studio-ui/src/components
    './src/components/ui/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Manter as cores primárias existentes para referência ou uso customizado se necessário
          // Mas shadcn vai usar as variáveis CSS --primary e --primary-foreground
          50: '#eef3ff',
          100: '#dae6ff',
          200: '#bedaff',
          300: '#97c3ff',
          400: '#6fa1ff',
          500: '#4f7dfe', // Este era o primary-500 original
          600: '#2563eb', // Este era o primary-600 original, que pode ser o novo --primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          // Manter as cores de accent existentes
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Manter a paleta gray customizada se ainda for necessária em algum lugar
        // ou mapeá-la para as variáveis do shadcn se apropriado.
        // Por agora, manter para não quebrar estilos existentes não migrados.
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        // Manter a fonte Inter se for a desejada, ou remover para usar o default do shadcn
        sans: ['Inter', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      boxShadow: {
        // Manter sombras customizadas se necessário
        panel: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      maxWidth: {
        // Manter max-widths customizados
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        // Manter z-index customizados
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Manter o plugin de forms se ainda for usado em partes não migradas para shadcn
    // Pode ser que os componentes de form do shadcn o tornem desnecessário
    require('@tailwindcss/forms')({ strategy: 'class' }),
  ],
}