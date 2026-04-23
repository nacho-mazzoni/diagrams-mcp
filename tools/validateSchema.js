export function validateSchema(schema) {
  const errors = [];
  const warnings = [];

  const entityMap = new Map();

  // =========================
  // 1. ENTIDADES
  // =========================
  for (const entity of schema.entities) {
    if (entityMap.has(entity.name)) {
      errors.push(`Entidad duplicada: "${entity.name}"`);
    } else {
      entityMap.set(entity.name, entity);
    }
  }

  // =========================
  // 2. ATRIBUTOS
  // =========================
  for (const entity of schema.entities) {
    const attrSet = new Set();

    for (const attr of entity.attributes) {
      if (attrSet.has(attr.name)) {
        errors.push(
          `Atributo duplicado "${attr.name}" en entidad "${entity.name}"`
        );
      }
      attrSet.add(attr.name);

      // validar ref
      if (attr.ref && !entityMap.has(attr.ref)) {
        errors.push(
          `Atributo "${entity.name}.${attr.name}" referencia entidad inexistente "${attr.ref}"`
        );
      }
    }
  }

  // =========================
  // 3. RELACIONES
  // =========================
  for (const rel of schema.relationships) {
    if (!entityMap.has(rel.from)) {
      errors.push(`Relación inválida: entidad origen "${rel.from}" no existe`);
    }

    if (!entityMap.has(rel.to)) {
      errors.push(`Relación inválida: entidad destino "${rel.to}" no existe`);
    }

    const fromEntity = entityMap.get(rel.from);

    if (fromEntity) {
      const hasField = fromEntity.attributes.some(
        (attr) => attr.name === rel.field
      );

      if (!hasField) {
        warnings.push(
          `Relación "${rel.from} -> ${rel.to}" usa campo "${rel.field}" que no existe en "${rel.from}"`
        );
      }
    }

    // validar tipo
    const validTypes = ["one-to-one", "one-to-many", "many-to-one", "many-to-many"];
    if (!validTypes.includes(rel.type)) {
      errors.push(
        `Tipo de relación inválido "${rel.type}" en "${rel.from} -> ${rel.to}"`
      );
    }
  }

  // =========================
  // RESULTADO
  // =========================
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}