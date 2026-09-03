import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.ts"],
    },
    resolve: {
        alias: {
            src: "/src",
            components: "/src/components",
            constant: "/src/constant",
            providers: "/src/providers",
            utils: "/src/utils",
            hooks: "/src/hooks",
            pages: "/src/pages",
            services: "/src/services",
            queries: "/src/queries",
            types: "/src/types",
            stores: "/src/stores",
            schemas: "/src/schemas",
        },
    },
});