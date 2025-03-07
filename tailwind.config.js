/** @type {import('tailwindcss').Config} */
const primeui = require('tailwindcss-primeui');
module.exports = {
    darkMode: ['selector', '[class="app-dark"]'],
    content: ['./src/**/*.{html,ts,scss,css}', './index.html'],
    plugins: [primeui],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#ff6b00',
                    50: '#fff7f0',
                    100: '#ffead9',
                    200: '#ffd4b3',
                    300: '#ffb980',
                    400: '#ff934d',
                    500: '#ff6b00', // Color base
                    600: '#ff5500',
                    700: '#cc4400',
                    800: '#a63800',
                    900: '#802b00',
                    950: '#4d1a00'
                }
            }
        }
    }
};
