const movement = require('./movement');
const inventory = require('./inventory');
const command = require('./command');

module.exports = {
    movement,
    command,
    ...inventory
};
