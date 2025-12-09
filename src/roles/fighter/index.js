const config = require('./config');
const getSystemPrompt = require('./systemPrompt');
const fighterTools = require('./tools');
const { buildRegistry } = require('../../tools/toolRegistry');

const { schemas, executors } = buildRegistry(fighterTools);

module.exports = {
    config,
    getSystemPrompt,
    tools: schemas,
    actions: executors
};
