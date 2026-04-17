import fs from "fs";
import { parseTextToER } from "./parsers/textToER.js";
import { generateERDiagram } from "./tools/erDiagram.js";

const text = `
Usuario
id pk
nombre

Pedido
id pk
usuario_id fk
fecha

Usuario 1..* Pedido
`;

const data = parseTextToER(text);

const result = await generateERDiagram(data);

fs.writeFileSync("er-text.svg", result.svg);