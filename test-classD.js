import { generateClassDiagram } from "./tools/classDiagram.js";
import fs from "fs/promises";

const data = {
  classes: [
    {
      name: "User",
      attributes: ["id", "name", "email"],
      methods: ["login()", "logout()"]
    },
    {
      name: "Order",
      attributes: ["id", "total"]
    }
  ],
  relations: [
    { from: "User", to: "Order" }
  ]
};

async function main() {
  try {
    const result = await generateClassDiagram(data);

    console.log("SVG generado correctamente:");
    await fs.writeFile("test-diagram.svg", result.svg);
    console.log("Archivo test-diagram.svg generado");
  } catch (error) {
    console.error("Error generando diagrama:");
    console.error(error);
  }
}

main();