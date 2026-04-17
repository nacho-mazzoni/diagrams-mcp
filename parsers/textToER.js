export function parseTextToER(text) {
  const blocks = text
    .split(/\n\s*\n/) // separar por líneas en blanco
    .map(b => b.trim())
    .filter(Boolean);

  const entities = {};
  const relations = [];

  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

    // relación en bloque solo
    if (lines.length === 1) {
      const match = lines[0].match(
        /^(\w+)\s+(1|\*|0\.\.1|1\.\.1|1\.\.\*|0\.\.\*)\s+(\w+)$/i
      );

      if (match) {
        const [, from, card, to] = match;

        entities[from] ??= { name: from, attributes: [] };
        entities[to] ??= { name: to, attributes: [] };

        relations.push({
          from,
          to,
          fromCard: "1",
          toCard: card,
          label: "rel"
        });
      }

      continue;
    }

    // entidad + atributos
    const entityName = lines[0];

    entities[entityName] ??= {
      name: entityName,
      attributes: []
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      const match = line.match(/^(\w+)(\s+pk|\s+fk)?$/i);
      if (!match) continue;

      const [, attr, modifier] = match;

      entities[entityName].attributes.push({
        name: attr,
        pk: modifier?.trim() === "pk",
        fk: modifier?.trim() === "fk"
      });
    }
  }

  return {
    entities: Object.values(entities),
    relations
  };
}