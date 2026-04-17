import fs from "fs";
import { textToClass } from "./parsers/textToClass.js";
import { generateClassDiagram } from "./tools/classDiagram.js";

const text = `
Usuario tiene +nombre:string
Usuario tiene -password:string
Usuario tiene #edad:int

Usuario metodo +login()
Usuario metodo +logout()

Admin extiende Usuario
Pedido tiene +fecha:Date
Pedido pertenece Usuario
`;

const data = textToClass(text);
const result = await generateClassDiagram(data);

fs.writeFileSync("class-diagram.svg", result.svg);

console.log("class-diagram.svg generado");