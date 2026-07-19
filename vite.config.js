import { defineConfig } from 'vite';

// This repository is published as the account-level GitHub Pages site.
export default defineConfig({
    base: '/',
    assetsInclude: ['**/*.pdf'],
});
