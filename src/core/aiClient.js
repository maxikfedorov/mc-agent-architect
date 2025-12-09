const OpenAI = require('openai');

function createAIClient(config) {
    return new OpenAI(config.ai);
}

module.exports = { createAIClient };
