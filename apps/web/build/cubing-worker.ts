import type { Plugin } from "vite";

/** Compile cubing's portable worker URL as a separate Vite worker graph. */
export function cubingWorker(): Plugin {
  return {
    name: "cubing-module-worker",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/cubing/dist/lib/cubing/")) return null;
      if (!code.includes("function searchWorkerURLImportMetaResolve()"))
        return null;

      const resolveURL =
        'return import.meta.resolve("./search-worker-entry.js");';
      const createURL =
        'return new URL("./search-worker-entry.js", import.meta.url);';
      if (!code.includes(resolveURL) || !code.includes(createURL)) {
        throw new Error(
          "cubing.js worker entry changed; update and verify the Vite adapter",
        );
      }

      return {
        code:
          'import cubingWorkerURL from "./search-worker-entry.js?worker&url";\n' +
          code
            .replace(resolveURL, "return cubingWorkerURL;")
            .replace(
              createURL,
              "return new URL(cubingWorkerURL, import.meta.url);",
            ),
        map: null,
      };
    },
  };
}
