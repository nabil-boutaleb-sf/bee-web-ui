const Bee = require('beeai');

const bee = new Bee({ apiKey: process.env.BEE_API_TOKEN });

async function getFacts(confirmed, page = 1, limit = 10) {
  try {
    const facts = await bee.getFacts('me', { confirmed, page, limit });
    return facts;
  } catch (error) {
    console.error('Error fetching facts from Bee AI SDK:', error.message);
    throw new Error('Failed to fetch facts from Bee AI SDK.');
  }
}

async function deleteFact(factId) {
  try {
    await bee.deleteFact('me', factId);
  } catch (error) {
    console.error(`Error deleting fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to delete fact from Bee AI SDK.');
  }
}

async function confirmFact(factId) {
  try {
    await bee.updateFact('me', factId, { confirmed: true });
  } catch (error) {
    console.error(`Error confirming fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to confirm fact from Bee AI SDK.');
  }
}

async function getTodos() {
  try {
    const todos = await bee.getTodos('me');
    return todos.todos; // The documentation shows todos are nested under a 'todos' property
  } catch (error) {
    console.error('Error fetching todos from Bee AI SDK:', error.message);
    throw new Error('Failed to fetch todos from Bee AI SDK.');
  }
}

async function checkAuthStatus() {
  try {
    // Attempt to fetch facts as a way to verify authentication
    await bee.getFacts('me'); 
    return true;
  } catch (error) {
    console.error('Authentication check failed with Bee AI SDK:', error.message);
    return false;
  }
}

module.exports = {
  getFacts,
  deleteFact,
  confirmFact,
  getTodos,
  checkAuthStatus
};