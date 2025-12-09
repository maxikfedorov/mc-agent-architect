let inventoryLock = Promise.resolve();

function getInventoryLock() {
    return inventoryLock;
}

function setInventoryLock(promise) {
    inventoryLock = promise;
}

module.exports = { getInventoryLock, setInventoryLock };
