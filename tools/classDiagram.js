import fs from "fs";
import { execSync } from "child_process";
import os from "os";
import path from "path";

function normalizeMember(member) {
  // Si el agente decidió mandar un objeto en lugar de un string
  if (typeof member === "object" && member !== null) {
    const visibility = member.visibility || "+";
    const name = member.name || "";
    const type = member.type ? `:${member.type}` : "";
    
    // Armamos el string que espera Mermaid: "+nombre:tipo"
    return `${visibility}${name}${type}`.replace(/\s+/g, " ").trim();
  }

  // Si mandó un string normal (como esperábamos originalmente)
  if (typeof member === "string") {
    return member
      .replace(/\s*:\s*/g, ":")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "";
}

function buildClassDiagram(data) {
  const lines = ["classDiagram", ""];

  // clases con bloques
  for (const cls of data.classes || []) {
    lines.push(`class ${cls.name} {`);

    for (const attr of cls.attributes || []) {
      lines.push(`  ${normalizeMember(attr)}`);
    }

    for (const method of cls.methods || []) {
      lines.push(`  ${normalizeMember(method)}`);
    }

    lines.push("}");
    lines.push("");
  }

  // relaciones
  for (const rel of data.relations || []) {
    if (rel.type === "inheritance") {
      lines.push(`${rel.to} <|-- ${rel.from}`);
    } else {
      lines.push(
        `${rel.from} --> ${rel.to}${rel.label ? " : " + rel.label : ""}`
      );
    }
  }

  return lines.join("\n");
}

export async function generateClassDiagram(data, format = "svg") {
  const diagram = buildClassDiagram(data);

  const isPdf = format.toLowerCase() === "pdf";

  // Si es PDF lo guarda en tu proyecto actual. Si es SVG, va a temporales.
  const baseDir = isPdf ? process.cwd() : os.tmpdir();
  const tmpBase = path.join(baseDir, `DiagramaClases-${Date.now()}`);

  const inputFile = `${tmpBase}.mmd`;
  const outputFile = `${tmpBase}.${isPdf ? "pdf" : "svg"}`;

  fs.writeFileSync(inputFile, diagram);

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