import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        hmr: {
            overlay: false,
        },
        proxy: {
            // Redirige toutes les requêtes commençant par /api vers Laravel
            "/api": {
                target: "https://pfe-saytu-edu.onrender.com",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
