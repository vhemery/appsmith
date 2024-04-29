import fg from "fast-glob";
import type { PathLike } from "fs";
import fs from "fs-extra";
import path from "path";

const createReactComponent = (name: string, svg: string) => {
  return `import React from "react";
export const ${name} = () => ${svg};
`;
};

async function generateComponents() {
  const entries = await fg("./src/icons/**/*.svg");

  entries.map(async (filepath: PathLike) => {
    await fs.readFile(filepath, "utf-8", async (err, file) => {
      if (err) {
        // eslint-disable-next-line no-console
        return console.error(err);
      }

      const dir = path.dirname(filepath as string).replace("./src/icons/", "");
      let name = path.basename(filepath as string).replace(".svg", "");

      switch (dir) {
        case "Icons":
          name += "Icon";
          break;
        case "Thumbnails":
          name += "Thumbnail";
          break;
      }

      await fs.writeFile(
        `./src/components/${dir}/${name}.tsx`,
        createReactComponent(name, file),
        "utf8",
        function (err) {
          // eslint-disable-next-line no-console
          if (err) return console.error(err);
        },
      );
    });
  });

  // eslint-disable-next-line no-console
  console.error(
    "\x1b[32mReact components generation completed successfully!\x1b[0m",
  );
}

generateComponents();
