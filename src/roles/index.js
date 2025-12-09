const architect = require('./architect');
const fighter = require('./fighter');  // ДОБАВИТЬ

const ROLES = {
    architect,
    fighter  // ДОБАВИТЬ
};

function getRole(roleName) {
    const role = ROLES[roleName];
    if (!role) {
        throw new Error(`Role '${roleName}' not found. Available: ${Object.keys(ROLES).join(', ')}`);
    }
    return role;
}

module.exports = { getRole, ROLES };
