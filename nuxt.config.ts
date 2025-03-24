// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },

    modules: [
        "@nuxt/ui",
        "@nuxt/eslint",
        "nuxt-chatgpt",
    ],
    colorMode: {
        preference: "dark", // default value of $colorMode.preference
        fallback: "dark", // fallback value if not system preference found
        hid: "nuxt-color-mode-script",
        globalName: "__NUXT_COLOR_MODE__",
        componentName: "ColorScheme",
        classPrefix: "",
        classSuffix: "-mode",
        storage: "localStorage", // or 'sessionStorage' or 'cookie'
        storageKey: "nuxt-color-mode",
    },

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
