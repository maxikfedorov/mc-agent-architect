const tools = [
  {
    type: "function",
    function: {
      name: "execute_code",
      description:
        "Write and execute async JavaScript code. Available functions: \n1. placeBlock(name, x, y, z) -> Relative to bot (x,y,z are offsets).\n2. placeBlockAbsolute(name, x, y, z) -> World coordinates.\n3. giveMe(name, count) -> Get items.",
      parameters: {
        type: "object",
        properties: {
          reasoning: {
            type: "string",
            description: "Step-by-step logic. Calculate bounds and loop ranges first.",
          },
          script: {
            type: "string",
            description: "The JavaScript code.",
          },
        },
        required: ["reasoning", "script"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "chat",
      description: "Send a message to chat.",
      parameters: {
        type: "object",
        properties: { message: { type: "string" } },
        required: ["message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "come_to_player",
      description: "Go to a player.",
      parameters: {
        type: "object",
        properties: { target: { type: "string" } },
        required: ["target"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_creative_item",
      description: "Get item in Creative mode (Single item). For bulk use execute_code.",
      parameters: {
        type: "object",
        properties: { item: { type: "string" }, count: { type: "integer" } },
        required: ["item"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "drop_inventory",
      description: "Drop all items.",
      parameters: { type: "object", properties: {} },
    },
  },
];

module.exports = tools;
