export function textToER(text) {
  const entitiesMap = new Map();
  const relations = [];

  const lines = text.split("\n");

  function ensureEntity(name) {
    if (!entitiesMap.has(name)) {
      entitiesMap.set(name, {
        name,
        attributes: []
      });
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Declarar una entidad. Ej: "Entidad Usuario"
    let match = trimmed.match(/^Entidad\s+(\w+)/i);
    if (match) {
      ensureEntity(match[1]);
      continue;
    }

    // Atributos (soporta PK y FK). Ej: "Usuario tiene id PK" o "Usuario tiene email"
    match = trimmed.match(/^(\w+)\s+tiene\s+(\w+)(?:\s+(PK|FK))?/i);
    if (match) {
      const [, entityName, attrName, keyType] = match;
      ensureEntity(entityName);

      const attr = { name: attrName };
      
      if (keyType) {
        if (keyType.toUpperCase() === 'PK') attr.pk = true;
        if (keyType.toUpperCase() === 'FK') attr.fk = true;
      }

      entitiesMap.get(entityName).attributes.push(attr);
      continue;
    }

    // Relaciones. Ej: "Usuario one-to-many Post : escribe" o "Snap many-to-one User"
    match = trimmed.match(/^(\w+)\s+(one-to-one|one-to-many|many-to-one|many-to-many)\s+(\w+)(?:\s*:\s*(.+))?/i);
    if (match) {
      const [, from, type, to, label] = match;
      ensureEntity(from);
      ensureEntity(to);

      relations.push({
        from,
        to,
        type: type.toLowerCase(),
        label: label ? label.trim() : "relacion"
      });
      continue;
    }
  }

  return {
    entities: [...entitiesMap.values()],
    relations
  };
}