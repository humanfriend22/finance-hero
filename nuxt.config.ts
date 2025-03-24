// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },

    modules: [
        "@nuxt/ui",
        "@nuxt/eslint",
        "nuxt-chatgpt",
    ],

    css: ["~/assets/css/main.css"],

    future: {
        compatibilityVersion: 4,
    },

    chatgpt: {
        apiKey:
            "N7AHLAPJIWHR009ZU8Z5N26XEDVECM2CO301L7JBKZC9VFG10GCI83NHMK6TMUXV",
    },

    compatibilityDate: "2024-11-27",
});
