import { defineConfig } from 'vite';

// Keep built assets relative so the same package works at a site's root or
// under a project path such as /testdwislandGPT/ on GitHub Pages.
export default defineConfig({ base: './' });
