import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
    visualizer({
      emitFile: true,
      filename: "stats.html",
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          protobuf: ["google-protobuf"],
          grpc_web: ["grpc-web"],
          bbthings_grpc: ["bbthings_grpc"]
        }
      }
    }
  },
});
