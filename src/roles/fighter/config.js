module.exports = {
    name: 'Fighter',
    description: 'PVP Combat Specialist',
    temperature: 0.2,  // Немного выше для тактического разнообразия
    model: 'local-model',
    max_tokens: 1024,  // Меньше токенов - быстрее реакция
    top_p: 0.85,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
};
