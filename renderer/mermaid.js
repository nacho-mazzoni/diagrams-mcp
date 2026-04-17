import { exec } from "child_process";
import fs from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function renderMermaid(content) {
  const file = path.join(tmpdir(), `diagram-${Date.now()}.mmd`);
  const out = file.replace(".mmd", ".svg");

  await fs.writeFile(file, content);
  await exec(`mmdc -i ${file} -o ${out}`);

  return await fs.readFile(out, "utf-8");
}