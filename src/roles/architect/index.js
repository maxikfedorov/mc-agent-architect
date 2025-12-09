const config = require('./config');
const getSystemPrompt = require('./systemPrompt');
const architectTools = require('./tools');
const { buildRegistry } = require('../../tools/toolRegistry');

const { schemas, executors } = buildRegistry(architectTools);

module.exports = {
    config,
    getSystemPrompt,
    tools: schemas,
    actions: executors
};
