import { generateERDiagram } from "./tools/erDiagram.js";
import fs from "fs";

const data = {
  entities: [
    { name: "Usuario", attributes: ["id", "nombre"] },
    { name: "Pedido", attributes: ["id", "fecha"] }
  ],
  relations: [
    {
      from: "Usuario",
      to: "Pedido",
      fromCard: "1",
      toCard: "1..*",
      label: "realiza"
    }
  ]
};

const result = await generateERDiagram(data);

fs.writeFileSync("er.svg", result.svg);