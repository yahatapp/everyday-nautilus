{
  description = "Everyday Nautilus development and CI tools";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/d54020a6ac3211e9f4201631bdf67678818c0cdf";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      manifest = builtins.fromJSON (builtins.readFile ./package.json);
      pnpmVersion = nixpkgs.lib.removePrefix "pnpm@" manifest.packageManager;
      toolsFor =
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          pnpm = pkgs.pnpm_11.override {
            version = pnpmVersion;
            hash = "sha256-he8u/yFqGukIBMAMjfv6ZoU1NkRlDRCQaok8Ba7c2IQ=";
            nodejs-slim = pkgs.nodejs_24;
          };
        in
        {
          inherit pkgs pnpm;
        };
    in
    {
      devShells = forAllSystems (
        system:
        let
          inherit (toolsFor system) pkgs pnpm;
        in
        {
          default = pkgs.mkShellNoCC {
            packages = [
              pnpm
              pkgs.git
              pkgs.bashInteractive
              pkgs.betterleaks
              pkgs.lefthook
              pkgs.actionlint
              pkgs.shellcheck
              pkgs.nixfmt
            ];
          };
        }
      );

      formatter = forAllSystems (system: (toolsFor system).pkgs.nixfmt);

      toolVersions = forAllSystems (
        system:
        let
          inherit (toolsFor system) pkgs pnpm;
        in
        {
          pnpm = pnpm.version;
          git = pkgs.git.version;
          betterleaks = pkgs.betterleaks.version;
          lefthook = pkgs.lefthook.version;
          actionlint = pkgs.actionlint.version;
          nodeRuntime = manifest.devEngines.runtime.version;
        }
      );
    };
}
