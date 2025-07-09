document.addEventListener('DOMContentLoaded', async () => {
    const authStatusDiv = document.getElementById('auth-status');
    const factsContainer = document.getElementById('facts-container');
    const conversationsContainer = document.getElementById('conversations-container');
    const todosContainer = document.getElementById('todos-container');

    // --- Authentication Status (for index.html) ---
    if (authStatusDiv) {
        try {
            const response = await fetch('/api/auth/status');
            const data = await response.json();

            if (data.isAuthenticated) {
                authStatusDiv.textContent = 'Status: Connected to Bee API';
                authStatusDiv.style.color = 'green';
            } else {
                authStatusDiv.textContent = 'Status: Not connected to Bee API. Check your token.';
                authStatusDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error fetching authentication status:', error);
            authStatusDiv.textContent = 'Status: Error checking connection.';
            authStatusDiv.style.color = 'orange';
        }
    }

    // --- Todos Page (for todos.html) ---
    if (todosContainer) {
        loadTodos();
        const todoSearchInput = document.getElementById('todo-search');
        if (todoSearchInput) {
            todoSearchInput.addEventListener('input', () => {
                // Debounce search to avoid excessive API calls
                clearTimeout(todoSearchInput.searchTimeout);
                todoSearchInput.searchTimeout = setTimeout(() => {
                    currentPageTodos = 1; // Reset to first page for new search
                    loadTodos(todoSearchInput.value);
                }, 300);
            });
        }
    }

    // --- Facts Page (for facts.html) ---
    if (factsContainer) {
        loadFacts(); // Initial load
        const factSearchInput = document.getElementById('fact-search');
        if (factSearchInput) {
            factSearchInput.addEventListener('input', () => {
                clearTimeout(factSearchInput.searchTimeout);
                factSearchInput.searchTimeout = setTimeout(() => {
                    currentPageConfirmed = 1; // Reset page for new search
                    currentPageUnconfirmed = 1; // Reset page for new search
                    loadFacts(factSearchInput.value);
                }, 300);
            });
        }
    }

    // --- Conversations Page (for conversations.html) ---
    if (conversationsContainer) {
        loadConversations(); // Initial load
        const conversationSearchInput = document.getElementById('conversation-search');
        if (conversationSearchInput) {
            conversationSearchInput.addEventListener('input', () => {
                clearTimeout(conversationSearchInput.searchTimeout);
                conversationSearchInput.searchTimeout = setTimeout(() => {
                    // Note: Conversations API doesn't have pagination in the current setup.
                    // Search will filter all loaded conversations.
                    loadConversations(conversationSearchInput.value);
                }, 300);
            });
        }
    }
});


let currentPageTodos = 1;
const todosLimit = 10;
let allTodos = []; // Cache for all todos to filter locally

async function loadTodos(searchTerm = '') {
    const incompleteTodosList = document.getElementById('incomplete-todos-list');
    const completedTodosList = document.getElementById('completed-todos-list');
    const todosContainer = document.getElementById('todos-container');

    try {
        // Fetch all todos if not already cached or if it's the initial load without search
        // If there's a search term, we assume the API supports it or we filter client-side.
        // For this example, let's assume the API /api/todos does NOT support a search query parameter.
        // So, we'll fetch all and filter client-side.
        // A more robust solution would involve backend search.
        if (allTodos.length === 0 || searchTerm === '') { // Simplified condition, might need refinement
            const response = await fetch(`/api/todos?page=1&limit=1000`); // Fetch a large number to simulate getting all
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allTodos = data.todos; // Cache them
        }

        let todosToDisplay = allTodos;

        if (searchTerm) {
            todosToDisplay = allTodos.filter(todo => todo.text.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Apply pagination to the filtered list
        const startIndex = (currentPageTodos - 1) * todosLimit;
        const endIndex = startIndex + todosLimit;
        const paginatedTodos = todosToDisplay.slice(startIndex, endIndex);
        const totalPages = Math.ceil(todosToDisplay.length / todosLimit) || 1;


        incompleteTodosList.innerHTML = '';
        completedTodosList.innerHTML = '';

        const incompleteTodos = paginatedTodos.filter(todo => !todo.completed);
        const completedTodos = paginatedTodos.filter(todo => todo.completed);

        if (incompleteTodos.length === 0) {
            incompleteTodosList.innerHTML = '<p>No incomplete todos found.</p>';
        } else {
            const ul = document.createElement('ul');
            incompleteTodos.forEach(todo => {
                const li = document.createElement('li');
                li.textContent = todo.text;
                li.dataset.todoId = todo.id;

                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');

                const completeButton = document.createElement('button');
                completeButton.innerHTML = '<i class="fas fa-check"></i>';
                completeButton.classList.add('icon-btn', 'confirm-btn');
                completeButton.onclick = () => completeTodo(todo.id);
                buttonContainer.appendChild(completeButton);

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.classList.add('icon-btn', 'edit-btn');
                editButton.onclick = () => editTodo(li, todo.id, todo.text);
                buttonContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.classList.add('icon-btn', 'delete-btn');
                deleteButton.onclick = () => deleteTodo(todo.id);
                buttonContainer.appendChild(deleteButton);

                li.appendChild(buttonContainer);
                ul.appendChild(li);
            });
            incompleteTodosList.appendChild(ul);
        }

        if (completedTodos.length === 0) {
            completedTodosList.innerHTML = '<p>No completed todos found.</p>';
        } else {
            const ul = document.createElement('ul');
            completedTodos.forEach(todo => {
                const li = document.createElement('li');
                li.textContent = todo.text;
                li.dataset.todoId = todo.id;
                li.classList.add('completed');

                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.classList.add('icon-btn', 'delete-btn');
                deleteButton.onclick = () => deleteTodo(todo.id);
                buttonContainer.appendChild(deleteButton);

                li.appendChild(buttonContainer);
                ul.appendChild(li);
            });
            completedTodosList.appendChild(ul);
        }

        // Pagination for todos
        let paginationContainer = todosContainer.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.remove();
        }
        paginationContainer = document.createElement('div');
        paginationContainer.classList.add('pagination-container');

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPageTodos === 1;
        prevButton.onclick = () => {
            currentPageTodos--;
            loadTodos(document.getElementById('todo-search')?.value || '');
        };
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageTodos} of ${totalPages}`;
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageTodos >= totalPages;
        nextButton.onclick = () => {
            currentPageTodos++;
            loadTodos(document.getElementById('todo-search')?.value || '');
        };
        paginationContainer.appendChild(nextButton);

        todosContainer.appendChild(paginationContainer);

    } catch (error) {
        console.error('Failed to load todos:', error);
        incompleteTodosList.innerHTML = '<p>Error loading incomplete todos. Check the console for details.</p>';
        completedTodosList.innerHTML = '<p>Error loading completed todos. Check the console for details.</p>';
    }
}

async function completeTodo(todoId) {
    try {
        const response = await fetch(`/api/todos/${todoId}/complete`, { method: 'PUT' });
        if (response.ok) {
            loadTodos(document.getElementById('todo-search')?.value || '');
        } else {
            alert('Failed to complete todo.');
        }
    } catch (error) {
        console.error('Error completing todo:', error);
        alert('Error completing todo.');
    }
}

async function deleteTodo(todoId) {
    try {
        const response = await fetch(`/api/todos/${todoId}`, { method: 'DELETE' });
        if (response.ok) {
            loadTodos(document.getElementById('todo-search')?.value || '');
        } else {
            alert('Failed to delete todo.');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Error deleting todo.');
    }
}

function editTodo(li, todoId, currentText) {
    const originalContent = li.innerHTML; // Save the original content
    li.innerHTML = ''; // Clear the list item

    const form = document.createElement('form');
    form.classList.add('edit-fact-form'); // Re-use the same style as facts
    form.onsubmit = (e) => {
        e.preventDefault();
        updateTodo(todoId, input.value);
    };

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.classList.add('edit-fact-input');
    form.appendChild(input);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const saveButton = document.createElement('button');
    saveButton.innerHTML = '<i class="fas fa-save"></i>';
    saveButton.type = 'submit';
    saveButton.classList.add('icon-btn', 'confirm-btn');
    buttonContainer.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = '<i class="fas fa-times"></i>';
    cancelButton.type = 'button';
    cancelButton.classList.add('icon-btn', 'delete-btn');
    cancelButton.onclick = () => {
        li.innerHTML = originalContent; // Restore original content
        // Re-attach event listeners
        const editButton = li.querySelector('.edit-btn');
        if (editButton) {
            editButton.onclick = () => editTodo(li, todoId, currentText);
        }
        const deleteButton = li.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.onclick = () => deleteTodo(todoId);
        }
        const completeButton = li.querySelector('.confirm-btn');
        if (completeButton) {
            completeButton.onclick = () => completeTodo(todoId);
        }
    };
    buttonContainer.appendChild(cancelButton);

    form.appendChild(buttonContainer);
    li.appendChild(form);
    input.focus();
}

async function updateTodo(todoId, text) {
    try {
        const response = await fetch(`/api/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        if (response.ok) {
            loadTodos(document.getElementById('todo-search')?.value || '');
        } else {
            alert('Failed to update todo.');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Error updating todo.');
    }
}

let currentPageConfirmed = 1;
let currentPageUnconfirmed = 1;
const limit = 10; // Used for pagination, not for initial fetch if searching
let allConfirmedFacts = [];
let allUnconfirmedFacts = [];

async function loadFacts(searchTerm = '') {
    await loadConfirmedFacts(searchTerm);
    await loadUnconfirmedFacts(searchTerm);
}

async function loadConfirmedFacts(searchTerm = '') {
    const confirmedFactsList = document.getElementById('confirmed-facts-list');
    try {
        if (allConfirmedFacts.length === 0 || searchTerm === '') { // Fetch only if cache is empty or no search
            const response = await fetch(`/api/facts?confirmed=true&page=1&limit=1000`); // Fetch all
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allConfirmedFacts = data.facts;
        }

        let factsToDisplay = allConfirmedFacts;
        if (searchTerm) {
            factsToDisplay = allConfirmedFacts.filter(fact => fact.text.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Apply pagination to the filtered list
        const startIndex = (currentPageConfirmed - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedFacts = factsToDisplay.slice(startIndex, endIndex);
        const totalPages = Math.ceil(factsToDisplay.length / limit) || 1;

        confirmedFactsList.innerHTML = '';

        if (paginatedFacts.length === 0) {
            confirmedFactsList.innerHTML = searchTerm ? '<p>No confirmed facts match your search.</p>' : '<p>No confirmed facts found.</p>';
        } else {
            const ul = document.createElement('ul');
            paginatedFacts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact.text;
                li.dataset.factId = fact.id;
                li.classList.add('confirmed');

                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');

                const unconfirmButton = document.createElement('button');
                unconfirmButton.innerHTML = '<i class="fas fa-times"></i>';
                unconfirmButton.classList.add('icon-btn', 'unconfirm-btn');
                unconfirmButton.onclick = () => unconfirmFact(fact.id);
                buttonContainer.appendChild(unconfirmButton);

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.classList.add('icon-btn', 'edit-btn');
                editButton.onclick = () => editFact(li, fact.id, fact.text);
                buttonContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.classList.add('icon-btn', 'delete-btn');
                deleteButton.onclick = () => deleteFact(fact.id);
                buttonContainer.appendChild(deleteButton);

                li.appendChild(buttonContainer);
                ul.appendChild(li);
            });
            confirmedFactsList.appendChild(ul);
        }

        // Pagination for confirmed facts
        const paginationContainer = document.createElement('div');
        paginationContainer.classList.add('pagination-container');

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPageConfirmed === 1;
        prevButton.onclick = () => {
            currentPageConfirmed--;
            loadConfirmedFacts(document.getElementById('fact-search')?.value || '');
        };
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageConfirmed} of ${totalPages}`;
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageConfirmed >= totalPages;
        nextButton.onclick = () => {
            currentPageConfirmed++;
            loadConfirmedFacts(document.getElementById('fact-search')?.value || '');
        };
        paginationContainer.appendChild(nextButton);

        confirmedFactsList.appendChild(paginationContainer);

    } catch (error) {
        console.error('Failed to load confirmed facts:', error);
        confirmedFactsList.innerHTML = '<p>Error loading confirmed facts. Check the console for details.</p>';
    }
}

async function loadUnconfirmedFacts(searchTerm = '') {
    const unconfirmedFactsList = document.getElementById('unconfirmed-facts-list');
    try {
        if (allUnconfirmedFacts.length === 0 || searchTerm === '') { // Fetch only if cache is empty or no search
            const response = await fetch(`/api/facts?confirmed=false&page=1&limit=1000`); // Fetch all
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allUnconfirmedFacts = data.facts;
        }

        let factsToDisplay = allUnconfirmedFacts;
        if (searchTerm) {
            factsToDisplay = allUnconfirmedFacts.filter(fact => fact.text.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Apply pagination to the filtered list
        const startIndex = (currentPageUnconfirmed - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedFacts = factsToDisplay.slice(startIndex, endIndex);
        const totalPages = Math.ceil(factsToDisplay.length / limit) || 1;

        unconfirmedFactsList.innerHTML = '';

        if (paginatedFacts.length === 0) {
            unconfirmedFactsList.innerHTML = searchTerm ? '<p>No unconfirmed facts match your search.</p>' : '<p>No unconfirmed facts found.</p>';
        } else {
            const ul = document.createElement('ul');
            paginatedFacts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact.text;
                li.dataset.factId = fact.id;
                li.classList.add('unconfirmed');

                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');

                const confirmButton = document.createElement('button');
                confirmButton.innerHTML = '<i class="fas fa-check"></i>';
                confirmButton.classList.add('icon-btn', 'confirm-btn');
                confirmButton.onclick = () => confirmFact(fact.id);
                buttonContainer.appendChild(confirmButton);

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.classList.add('icon-btn', 'edit-btn');
                editButton.onclick = () => editFact(li, fact.id, fact.text);
                buttonContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.classList.add('icon-btn', 'delete-btn');
                deleteButton.onclick = () => deleteFact(fact.id);
                buttonContainer.appendChild(deleteButton);

                li.appendChild(buttonContainer);
                ul.appendChild(li);
            });
            unconfirmedFactsList.appendChild(ul);
        }

        // Pagination for unconfirmed facts
        const paginationContainer = document.createElement('div');
        paginationContainer.classList.add('pagination-container');

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPageUnconfirmed === 1;
        prevButton.onclick = () => {
            currentPageUnconfirmed--;
            loadUnconfirmedFacts(document.getElementById('fact-search')?.value || '');
        };
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageUnconfirmed} of ${totalPages}`;
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageUnconfirmed >= totalPages;
        nextButton.onclick = () => {
            currentPageUnconfirmed++;
            loadUnconfirmedFacts(document.getElementById('fact-search')?.value || '');
        };
        paginationContainer.appendChild(nextButton);

        unconfirmedFactsList.appendChild(paginationContainer);

    } catch (error) {
        console.error('Failed to load unconfirmed facts:', error);
        unconfirmedFactsList.innerHTML = '<p>Error loading unconfirmed facts. Check the console for details.</p>';
    }
}

async function deleteFact(factId) {
    try {
        const response = await fetch(`/api/facts/${factId}`, { method: 'DELETE' });
        if (response.ok) {
            loadFacts(document.getElementById('fact-search')?.value || '');
        } else {
            alert('Failed to delete fact.');
        }
    } catch (error) {
        console.error('Error deleting fact:', error);
        alert('Error deleting fact.');
    }
}

async function confirmFact(factId) {
    try {
        const response = await fetch(`/api/facts/${factId}/confirm`, { method: 'PUT' });
        if (response.ok) {
            loadFacts(document.getElementById('fact-search')?.value || '');
        } else {
            alert('Failed to confirm fact.');
        }
    } catch (error) {
        console.error('Error confirming fact:', error);
        alert('Error confirming fact.');
    }
}

async function unconfirmFact(factId) {
    try {
        const response = await fetch(`/api/facts/${factId}/unconfirm`, { method: 'PUT' });
        if (response.ok) {
            loadFacts(document.getElementById('fact-search')?.value || '');
        } else {
            alert('Failed to unconfirm fact.');
        }
    } catch (error) {
        console.error('Error unconfirming fact:', error);
        alert('Error unconfirming fact.');
    }
}

async function updateFact(factId, text) {
    try {
        const response = await fetch(`/api/facts/${factId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        if (response.ok) {
            loadFacts(document.getElementById('fact-search')?.value || '');
        } else {
            alert('Failed to update fact.');
        }
    } catch (error) {
        console.error('Error updating fact:', error);
        alert('Error updating fact.');
    }
}

function editFact(li, factId, currentText) {
    const originalContent = li.innerHTML; // Save the original content
    li.innerHTML = ''; // Clear the list item

    const form = document.createElement('form');
    form.classList.add('edit-fact-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        updateFact(factId, input.value);
    };

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.classList.add('edit-fact-input');
    form.appendChild(input);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const saveButton = document.createElement('button');
    saveButton.innerHTML = '<i class="fas fa-save"></i>';
    saveButton.type = 'submit';
    saveButton.classList.add('icon-btn', 'confirm-btn');
    buttonContainer.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = '<i class="fas fa-times"></i>';
    cancelButton.type = 'button';
    cancelButton.classList.add('icon-btn', 'delete-btn');
    cancelButton.onclick = () => {
        li.innerHTML = originalContent; // Restore original content
        // Re-attach event listeners
        const editButton = li.querySelector('.edit-btn');
        if (editButton) {
            editButton.onclick = () => editFact(li, factId, currentText);
        }
        const deleteButton = li.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.onclick = () => deleteFact(factId);
        }
        const confirmButton = li.querySelector('.confirm-btn');
        if (confirmButton) {
            confirmButton.onclick = () => confirmFact(factId);
        }
        const unconfirmButton = li.querySelector('.unconfirm-btn');
        if (unconfirmButton) {
            unconfirmButton.onclick = () => unconfirmFact(factId);
        }
    };
    buttonContainer.appendChild(cancelButton);

    form.appendChild(buttonContainer);
    li.appendChild(form);
    input.focus();
}

let allConversations = []; // Cache for all conversations

async function loadConversations(searchTerm = '') {
    const conversationsContainer = document.getElementById('conversations-container');
    try {
        const response = await fetch(`/api/conversations?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const conversations = await response.json();

        conversationsContainer.innerHTML = '';

        if (conversations.length === 0) {
            conversationsContainer.innerHTML = searchTerm ? '<p>No conversations match your search.</p>' : '<p>No conversations found.</p>';
        } else {
            const ul = document.createElement('ul');
            conversations.forEach(conversation => {
                const li = document.createElement('li');
                // Re-create the accordion structure from previous work
                li.classList.add('conversation-item');
                li.dataset.conversationId = conversation.id;

                const triggerContainer = document.createElement('div');
                triggerContainer.classList.add('trigger-container');

                const title = document.createElement('h3');
                title.textContent = conversation.short_summary || 'Conversation';
                triggerContainer.appendChild(title);

                // Add other metadata if needed, like state or time

                li.appendChild(triggerContainer);
                ul.appendChild(li);
            });
            conversationsContainer.appendChild(ul);
        }
    } catch (error) {
        console.error('Failed to load conversations:', error);
        conversationsContainer.innerHTML = '<p>Error loading conversations. Check the console for details.</p>';
    }
}
