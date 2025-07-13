const Bee = require('beeai');

const getBeeInstance = (apiKey) => new Bee({ apiKey });

async function deleteFact(apiKey, factId) {
  const bee = getBeeInstance(apiKey);
  try {
    await bee.deleteFact('me', factId);
  } catch (error) {
    console.error(`Error deleting fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to delete fact from Bee AI SDK.');
  }
}

async function confirmFact(apiKey, factId) {
  const bee = getBeeInstance(apiKey);
  try {
    await bee.updateFact('me', factId, { confirmed: true });
  } catch (error) {
    console.error(`Error confirming fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to confirm fact from Bee AI SDK.');
  }
}

async function getTodos(apiKey, completed, page = 1, limit = 10, searchTerm = '') {
  const bee = getBeeInstance(apiKey);
  try {
    const response = await bee.getTodos('me', { completed, page: 1, limit: 1000 });
    let todos = response.todos || [];
    todos = todos.filter(todo => typeof todo.completed === 'boolean' && todo.completed === completed);
    if (searchTerm) {
      todos = todos.filter(todo =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const totalPages = Math.ceil(todos.length / limit);
    const paginatedTodos = todos.slice((page - 1) * limit, page * limit);
    return {
      todos: paginatedTodos,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error('Error fetching todos from Bee AI SDK:', error.message);
    throw new Error('Failed to fetch todos from Bee AI SDK.');
  }
}

async function checkAuthStatus(apiKey) {
  const bee = getBeeInstance(apiKey);
  try {
    await bee.getFacts('me'); 
    return true;
  } catch (error) {
    console.error('Authentication check failed with Bee AI SDK:', error.message);
    return false;
  }
}

async function getFacts(apiKey, confirmed, page = 1, limit = 10, searchTerm = '') {
  const bee = getBeeInstance(apiKey);
  try {
    const response = await bee.getFacts('me', { confirmed, page: 1, limit: 1000 });
    let facts = response.facts || [];
    if (searchTerm) {
      facts = facts.filter(fact =>
        fact.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const totalPages = Math.ceil(facts.length / limit);
    const paginatedFacts = facts.slice((page - 1) * limit, page * limit);
    return {
      facts: paginatedFacts,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error('Error fetching facts from Bee AI SDK:', error.message);
    throw new Error('Failed to fetch facts from Bee AI SDK.');
  }
}

async function completeTodo(apiKey, todoId) {
  const bee = getBeeInstance(apiKey);
  try {
    await bee.updateTodo('me', todoId, { completed: true });
  } catch (error) {
    console.error(`Error completing todo ${todoId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to complete todo from Bee AI SDK.');
  }
}

async function deleteTodo(apiKey, todoId) {
  const bee = getBeeInstance(apiKey);
  try {
    await bee.deleteTodo('me', todoId);
  } catch (error) {
    console.error(`Error deleting todo ${todoId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to delete todo from Bee AI SDK.');
  }
}

async function updateTodo(apiKey, todoId, text) {
    const bee = getBeeInstance(apiKey);
    try {
        await bee.updateTodo('me', todoId, { text });
    } catch (error) {
        console.error(`Error updating todo ${todoId} from Bee AI SDK:`, error.message);
        throw new Error('Failed to update todo from Bee AI SDK.');
    }
}

async function unconfirmFact(apiKey, factId) {
  const bee = getBeeInstance(apiKey);
  try {
    await bee.updateFact('me', factId, { confirmed: false });
  } catch (error) {
    console.error(`Error unconfirming fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to unconfirm fact from Bee AI SDK.');
  }
}

async function updateFact(apiKey, factId, text) {
  const bee = getBeeInstance(apiKey);
  try {
    await bee.updateFact('me', factId, { text });
  } catch (error) {
    console.error(`Error updating fact ${factId} from Bee AI SDK:`, error.message);
    throw new Error('Failed to update fact from Bee AI SDK.');
  }
}

async function getConversations(apiKey, page = 1, limit = 10, searchTerm = '') {
  const bee = getBeeInstance(apiKey);
  try {
    const response = await bee.getConversations('me', { limit: 1000 });
    let conversations = response.conversations || [];
    if (searchTerm) {
      conversations = conversations.filter(conv =>
        (conv.summary && conv.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conv.short_summary && conv.short_summary.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    const totalPages = Math.ceil(conversations.length / limit);
    const paginatedConversations = conversations.slice((page - 1) * limit, page * limit);
    return {
      conversations: paginatedConversations,
      totalPages: totalPages
    };
  } catch (error) {
    console.error('Error fetching conversations from Bee AI SDK:', error.message);
    throw new Error('Failed to fetch conversations from Bee AI SDK.');
  }
}

async function bulkDeleteTodos(apiKey, todoIds) {
    for (const todoId of todoIds) {
        await deleteTodo(apiKey, todoId);
    }
}

async function bulkCompleteTodos(apiKey, todoIds) {
    for (const todoId of todoIds) {
        await completeTodo(apiKey, todoId);
    }
}

async function bulkDeleteFacts(apiKey, factIds) {
    for (const factId of factIds) {
        await deleteFact(apiKey, factId);
    }
}

async function bulkConfirmFacts(apiKey, factIds) {
    for (const factId of factIds) {
        await confirmFact(apiKey, factId);
    }
}

async function bulkUnconfirmFacts(apiKey, factIds) {
    for (const factId of factIds) {
        await unconfirmFact(apiKey, factId);
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
  updateTodo,
  bulkDeleteTodos,
  bulkCompleteTodos,
  bulkDeleteFacts,
  bulkConfirmFacts,
  bulkUnconfirmFacts
};

