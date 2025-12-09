module.exports = {
    minecraft: {
        host: '127.0.0.1',
        port: 49419,
        username: 'Constructor',
        version: '1.16.5'
    },
    ai: {
        baseURL: 'http://localhost:1234/v1',
        apiKey: 'lm-studio',
        model: 'local-model',
        temperature: 0.1,
        max_tokens: 2048,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop: null
    }
};
