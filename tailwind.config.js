import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '420px',
        'fhd': '1824px',  /** 1920px */
        'qhd': '2432px',  /** 2560px */
        'qhd+': '3040px', /** 3200px */
        'uhd': '3648px'   /** 3840px */
      },
      fontFamily: {
        'inter': ['Inter', 'ui-sans-serif', 'sans-serif', 'Arial']
      },
      boxShadow: {
        'md_res': '0 0.25rem 0.375rem -0.0625rem rgb(0 0 0 / 0.1), 0 0.125rem 0.25rem -0.125rem rgb(0 0 0 / 0.1)'
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    daisyui
  ],
  daisyui: {
    themes: ["winter", "night"],
    darkMode: ['class', '[data-theme="night"]']
  },
};
