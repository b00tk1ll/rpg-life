/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                game: {
                    bg: '#0F172A', // Dark slate background
                    primary: '#16357D', // Cruzeiro Blue
                    secondary: '#FACC15', // Gold/Coins
                    text: '#F8FAFC', // Slate 50
                    accent: '#38BDF8', // Light blue accent
                    danger: '#EF4444', // Red for penalty
                    success: '#22C55E', // Green for success
                }
            }
        },
    },
    plugins: [],
}
