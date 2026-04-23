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

export async function generateERDiagram(data, format = "svg") {
  const diagram = buildERDiagram(data);

  const isPdf = format.toLowerCase() === "pdf";

  //Si es PDF lo guarda en tu proyecto actual. Si es SVG, va a temporales.
  const baseDir = isPdf ? process.cwd() : os.tmpdir();
  const tmpBase = path.join(baseDir, `DiagramaER-${Date.now()}`);

  const inputFile = `${tmpBase}.mmd`;
  const outputFile = `${tmpBase}.${isPdf ? "pdf" : "svg"}`;

  fs.writeFileSync(inputFile, diagram);

  // Generamos usando mmdc (forzamos fondo blanco para que el PDF no quede transparente/oscuro)
  execSync(`mmdc -i "${inputFile}" -o "${outputFile}" -b white`);

 if (isPdf) {
    // Si es PDF, borramos el .mmd para mantener limpio tu proyecto y devolvemos la ruta
    fs.unlinkSync(inputFile);
    return { isPdf: true, path: outputFile };
  }

  // Si es SVG, devolvemos el texto crudo como veníamos haciendo
  const svg = fs.readFileSync(outputFile, "utf8");
  return { isPdf: false, svg };
}