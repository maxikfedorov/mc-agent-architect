module.exports = {
    minecraft: {
        host: '127.0.0.1',
        port: 64003,       // <--- МЕНЯТЬ ТУТ
        username: 'Constructor',
        version: '1.16.5'
    },
    ai: {
        baseURL: 'http://localhost:1234/v1',
        apiKey: 'lm-studio',
        model: 'local-model', // LM Studio сама подставит загруженную (GPT-OSS-20B)
        temperature: 0.1
    }
};
