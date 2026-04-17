import fs from "fs";
import { execSync } from "child_process";

/**
 * Convierte cardinalidad a sintaxis Mermaid
 */
function mapCardinality(card) {
  switch (card) {
    case "1":
    case "1..1":
      return "||";
    case "0..1":
      return "o|";
    case "1..*":
      return "|{";
    case "0..*":
    case "*":
      return "o{";
    default:
      return "||";
  }
}

function buildERDiagram(data) {
  const lines = ["erDiagram", ""];

  // entidades
  for (const entity of data.entities || []) {
    lines.push(`${entity.name.toUpperCase()} {`);

    for (const attr of entity.attributes || []) {

      if (typeof attr === "string") {
        lines.push(`  string ${attr}`);
        continue;
      }

      let suffix = "";

      if (attr.pk) suffix += " PK";
      if (attr.fk) suffix += " FK";

      lines.push(`  string ${attr.name}${suffix}`);
    }

    lines.push("}");
    lines.push("");
  }

  // relaciones con cardinalidad
  for (const rel of data.relations || []) {
    const left = mapCardinality(rel.fromCard || "1");
    const right = mapCardinality(rel.toCard || "*");

    lines.push(
      `${rel.from.toUpperCase()} ${left}--${right} ${rel.to.toUpperCase()} : ${rel.label || ""}`
    );
  }

  return lines.join("\n");
}

export async function generateERDiagram(data) {
  const diagram = buildERDiagram(data);

  console.log("---- ER MERMAID ----");
  console.log(diagram);
  console.log("--------------------");

  const tmpBase = `/tmp/er-${Date.now()}`;
  const inputFile = `${tmpBase}.mmd`;
  const outputFile = `${tmpBase}.svg`;

  fs.writeFileSync(inputFile, diagram);

  execSync(`mmdc -i ${inputFile} -o ${outputFile}`);

  const svg = fs.readFileSync(outputFile, "utf8");

  return { svg };
}