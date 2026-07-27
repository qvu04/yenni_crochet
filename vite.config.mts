import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";

export default () => {
  return defineConfig({
    root: ".",
    base: "",
    plugins: [zaloMiniApp(), react()],
    resolve: {
      alias: {
        src: "/src",
        css: "/src/css",
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
        schemas: "/src/schemas"
      },
    },
  });
};
