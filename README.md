# diagrams-mcp

## Descripción

diagrams-mcp es un MCP que permite generar diagramas automáticamente a partir de texto o estructuras JSON. Actualmente soporta:

* Diagramas de clases (UML)
* Diagramas entidad-relación (ER)
* Generación mediante texto natural
* Exportación a SVG usando Mermaid
* Integración pensada para agentes MCP

El objetivo es permitir que un agente o usuario describa un sistema y obtener el diagrama correspondiente sin escribir Mermaid manualmente.

---

## Instalación

1. Clonar el repositorio

```
git clone https://github.com/nacho-mazzoni/diagrams-mcp.git
cd diagrams-mcp
```

2. Instalar dependencias

```
npm install
```

3. Instalar Mermaid CLI (si no está instalado)

```
npm install -g @mermaid-js/mermaid-cli
```

4. Verificar instalación

```
mmdc -h
```

---

## Uso

Este MCP está diseñado para trabajar junto a un agente. El flujo recomendado es:

1. Pedirle al agente que analice el código del proyecto.
2. Solicitar que el agente genere un JSON con:

   * Clases detectadas
   * Entidades
   * Atributos
   * Relaciones
   * Cambios realizados
3. Pasar ese JSON directamente al MCP.
4. El MCP genera automáticamente el diagrama correspondiente.

Esto permite que el diagrama se construya a partir del estado real del código o de los cambios introducidos por el agente, sin necesidad de escribir manualmente Mermaid.

El MCP acepta:

* JSON estructurado generado por el agente
* Texto natural describiendo el modelo
* Datos parciales para actualizar diagramas existentes

---

## Integración con un agente

Un usuario puede integrar diagrams-mcp a su agente siguiendo este flujo:

1. El usuario solicita al agente analizar el código o describir un sistema.
2. El agente genera un JSON estructurado con entidades, clases, atributos y relaciones.
3. El agente envía ese JSON al MCP.
4. diagrams-mcp genera el diagrama automáticamente.
5. El agente devuelve el SVG generado al usuario.

Flujo conceptual:

```
Usuario -> Agente -> JSON -> diagrams-mcp -> SVG -> Usuario
```

Esto permite que el diagrama refleje el estado real del código o los cambios realizados por el agente.

---

## Ejemplo de JSON generado por un agente

```
{
  "entities": [
    { "name": "Usuario", "attributes": ["id", "nombre"] },
    { "name": "Pedido", "attributes": ["id", "fecha"] }
  ],
  "relations": [
    {
      "from": "Usuario",
      "to": "Pedido",
      "fromCard": "1",
      "toCard": "1..*",
      "label": "realiza"
    }
  ]
}
```

Ese JSON se pasa directamente al MCP para generar el diagrama.

---

## Estructura del proyecto

```
diagrams-mcp
│
├── tools
│   ├── classDiagram.js
│   └── erDiagram.js
│
├── parsers
│   ├── textToClass.js
│   └── textToER.js
│
├── index.js
└── package.json
```

---

## Objetivo del proyecto

* Integración con agentes MCP
* Generación automática de diagramas durante desarrollo
* Soporte para texto natural
* Extensión futura a más tipos de diagramas

---

## Estado actual

* Diagramas ER con cardinalidad y claves PK y FK
* Diagramas de clases UML
* Parser desde texto
* Exportación SVG

---

## Aclaraciones
El MCP también soporta definición de entidades con atributos, claves primarias (PK) y foráneas (FK) mediante bloques de texto separados por líneas en blanco, permitiendo generar diagramas ER completos desde descripciones estructuradas.

