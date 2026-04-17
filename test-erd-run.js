import fs from "fs";
import { generateERDiagram } from "./tools/erDiagram.js";

const result = await generateERDiagram({
  entities: [
    { name: "Usuario", attributes: ["id", "nombre"] },
    { name: "Pedido", attributes: ["id", "fecha"] }
  ],
  relations: [
    { from: "Usuario", to: "Pedido", label: "realiza" }
  ]
});

fs.writeFileSync("diagram.svg", result.svg);
console.log("Diagram saved as diagram.svg");