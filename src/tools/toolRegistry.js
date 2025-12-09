const coreTools = require('./core');

function buildRegistry(roleSpecificTools = {}) {
    const allTools = { ...coreTools, ...roleSpecificTools };
    
    const schemas = Object.values(allTools).map(tool => tool.schema);
    
    const executors = {};
    for (const [key, tool] of Object.entries(allTools)) {
        executors[tool.schema.function.name] = tool.execute;
    }
    
    console.log(`[REGISTRY] Loaded ${schemas.length} tools: ${Object.keys(executors).join(', ')}`);
    
    return { schemas, executors };
}

module.exports = { buildRegistry };
