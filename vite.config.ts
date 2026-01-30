import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const rootDir = process.cwd();

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "client", "src"),
      "@shared": path.resolve(rootDir, "shared"),
      "@assets": path.resolve(rootDir, "client", "src", "assets"),
    },
  },
  root: path.resolve(rootDir, "client"),
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/') || id.includes('/react.')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('@tanstack')) return 'tanstack';
            if (id.includes('react-hook-form') || id.includes('@hookform')) return 'forms';
            if (id.includes('zod') || id.includes('drizzle')) return 'validation';
            if (id.includes('i18next')) return 'i18n';
            if (id.includes('date-fns')) return 'date-utils';
            return 'vendor';
          }
          if (id.includes('/components/ui/')) return 'ui-components';
        }
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    allowedHosts: true,
  },
});
