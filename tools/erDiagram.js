import fs from "fs";
import { execSync } from "child_process";
import os from "os";
import path from "path";

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

/**
 * Convierte textos como "many-to-one" a los lados izquierdo y derecho de Mermaid
 */
function parseRelationshipType(type) {
  switch (type?.toLowerCase()) {
    case "one-to-one":
      return { left: "||", right: "||" };
    case "one-to-many":
      return { left: "||", right: "o{" };
    case "many-to-one":
      return { left: "}o", right: "||" };
    case "many-to-many":
      return { left: "}o", right: "o{" };
    default:
      return { left: "||", right: "||" }; // Fallback
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
  const relationsArray = data.relationships || data.relations || [];
  for (const rel of relationsArray) {
    let leftCard, rightCard, label;

    if (rel.type) {
      const parsed = parseRelationshipType(rel.type);
      leftCard = parsed.left;
      rightCard = parsed.right;
      // Tomamos el field o un nombre genérico, y reemplazamos espacios por guiones bajos
      label = (rel.field || rel.description || "relacion").replace(/\s+/g, "_"); 
    } else {
      leftCard = mapCardinality(rel.fromCard || "1");
      rightCard = mapCardinality(rel.toCard || "*");
      label = (rel.label || "rel").replace(/\s+/g, "_");
    }

    // Generamos la conexión SIN comillas, que a veces rompe versiones viejas de mmdc
    lines.push(
      `${rel.from.toUpperCase()} ${leftCard}--${rightCard} ${rel.to.toUpperCase()} : ${label}`
    );
  }

  return lines.join("\n");
}

export async function generateERDiagram(data) {
  const diagram = buildERDiagram(data);

  console.log("---- ER MERMAID ----");
  console.log(diagram);
  console.log("--------------------");

  const tmpBase = path.join(os.tmpdir(), `er-${Date.now()}`);
  const inputFile = `${tmpBase}.mmd`;
  const outputFile = `${tmpBase}.svg`;

  fs.writeFileSync(inputFile, diagram);

  execSync(`mmdc -i ${inputFile} -o ${outputFile}`);

  const svg = fs.readFileSync(outputFile, "utf8");

  return { svg };
}