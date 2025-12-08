const basic = require('./basic'); // Файл ниже
const architect = require('./architect');

async function handleToolCall(bot, fnName, args, user) {
    console.log(`[ACTION] ${fnName}`, args);
    
    switch (fnName) {
        case 'chat':
            bot.chat(args.message);
            break;
        case 'come_to_player':
            await basic.comeToPlayer(bot, args.target);
            break;
        case 'drop_inventory':
            await basic.dropAll(bot);
            break;
        case 'get_creative_item':
            await basic.getCreativeItem(bot, args.item, args.count);
            break;
        case 'execute_code':
            const res = await architect.executeCode(bot, args.script);
            bot.chat(`Code result: ${res}`);
            break;
        default:
            console.log("Unknown tool:", fnName);
    }
}

module.exports = { handleToolCall };
