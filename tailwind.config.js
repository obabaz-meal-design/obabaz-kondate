/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'obabaz-warm': {
                    50: '#fff9f2',
                    100: '#ffefd9',
                    200: '#ffd9b3',
                    300: '#ffbf8c',
                    400: '#ff9c60',
                    500: '#ff7830',
                    600: '#f25a1b',
                    700: '#c94416',
                    800: '#a13718',
                    900: '#822f18',
                    950: '#46150a',
                },
                'obabaz-earth': {
                    50: '#f7f7f5',
                    100: '#eeede8',
                    200: '#dad7cd',
                    300: '#b8b4a6',
                    400: '#94907e',
                    500: '#767262',
                    600: '#5e5a4d',
                    700: '#4e4a40',
                    800: '#433f38',
                    900: '#3b3831',
                    950: '#1f1d19',
                }
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
