export default defineNuxtConfig({
  compatibilityDate: "2026-05-04",
  modules: ["../src/module"],
  formModule: {},
  css: ["@/assets/css/main.css"],
  devtools: { enabled: true },
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },
});
