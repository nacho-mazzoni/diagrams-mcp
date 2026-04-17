export function textToClass(text) {
  const classes = new Map();
  const relations = [];

  const lines = text.split("\n");

  function ensureClass(name) {
    if (!classes.has(name)) {
      classes.set(name, {
        name,
        attributes: [],
        methods: []
      });
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // atributos con visibilidad y tipo
    // Usuario tiene +nombre:string
    let match = trimmed.match(/(\w+)\s+tiene\s+([+\-#]?)(\w+)(?::(\w+))?/i);
    if (match) {
      const [, cls, vis, attr, type] = match;

      ensureClass(cls);

      const visibility = vis || "+";
      const attribute = type
        ? `${visibility}${attr} : ${type}`
        : `${visibility}${attr}`;

      classes.get(cls).attributes.push(attribute);
      continue;
    }

    // métodos
    // Usuario metodo +login()
    match = trimmed.match(/(\w+)\s+metodo\s+([+\-#]?)(\w+)\(\)/i);
    if (match) {
      const [, cls, vis, method] = match;

      ensureClass(cls);

      const visibility = vis || "+";
      classes.get(cls).methods.push(`${visibility}${method}()`);

      continue;
    }

    // herencia
    match = trimmed.match(/(\w+)\s+(extiende|hereda)\s+(\w+)/i);
    if (match) {
      const [, child, , parent] = match;

      ensureClass(child);
      ensureClass(parent);

      relations.push({
        from: child,
        to: parent,
        type: "inheritance"
      });

      continue;
    }

    // asociación
    match = trimmed.match(/(\w+)\s+(\w+)\s+(\w+)/);
    if (match) {
      const [, c1, rel, c2] = match;

      ensureClass(c1);
      ensureClass(c2);

      relations.push({
        from: c1,
        to: c2,
        label: rel,
        type: "association"
      });
    }
  }

  return {
    classes: [...classes.values()],
    relations
  };
}