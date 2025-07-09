const Bee = require('beeai');

const bee = new Bee({ apiKey: process.env.BEE_API_TOKEN });

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

async function getTodos(page = 1, limit = 10) {
  try {
    const response = await bee.getTodos('me', { page, limit });
    return response;
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

async function getFacts(confirmed, page = 1, limit = 10) {
  try {
    const facts = await bee.getFacts('me', { confirmed, page, limit });
    return facts;
  } catch (error) {
    console.error('Error fetching facts from Bee AI SDK:', error.message);
    throw new Error('Failed to fetch facts from Bee AI SDK.');
  }
}

async function completeTodo(todoId) {
  try {
    await bee.updateTodo('me', todoId, { completed: true });
  } catch (error) {
    console.error(`Error completing todo ${todoId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to complete todo from Bee AI SDK.');
  }
}

async function deleteTodo(todoId) {
  try {
    await bee.deleteTodo('me', todoId);
  } catch (error) {
    console.error(`Error deleting todo ${todoId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to delete todo from Bee AI SDK.');
  }
}

async function updateTodo(todoId, text) {
    try {
        await bee.updateTodo('me', todoId, { text });
    } catch (error) {
        console.error(`Error updating todo ${todoId} from Bee AI SDK:`, error.message);
        throw new Error('Failed to update todo from Bee AI SDK.');
    }
}

async function unconfirmFact(factId) {
  try {
    await bee.updateFact('me', factId, { confirmed: false });
  } catch (error) {
    console.error(`Error unconfirming fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to unconfirm fact from Bee AI SDK.');
  }
}

async function updateFact(factId, text) {
  try {
    await bee.updateFact('me', factId, { text });
  } catch (error) {
    console.error(`Error updating fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to update fact from Bee AI SDK.');
  }
}

async function getConversations(searchTerm = '') {
  try {
    // The SDK likely doesn't support a direct search term.
    // We fetch all and filter, which is what the frontend was trying to do.
    // A more robust solution would be to paginate and search on the backend if the API allowed it.
    const response = await bee.getConversations('me');
    let conversations = response.conversations;

    if (searchTerm) {
      conversations = conversations.filter(conv =>
        (conv.summary && conv.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conv.short_summary && conv.short_summary.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations from Bee AI SDK:', error.message);
    throw new Error('Failed to fetch conversations from Bee AI SDK.');
  }
}

module.exports = {
  getFacts,
  deleteFact,
  confirmFact,
  getTodos,
  checkAuthStatus,
  completeTodo,
  deleteTodo,
  unconfirmFact,
  updateFact,
  getConversations,
  updateTodo
};