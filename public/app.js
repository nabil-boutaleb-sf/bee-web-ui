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
        // Event listeners for bulk actions - Todos
        document.getElementById('select-all-incomplete-todos')?.addEventListener('change', (e) => toggleSelectAll(e.target, 'incomplete-todos-list'));
        document.getElementById('bulk-delete-incomplete-todos')?.addEventListener('click', () => bulkDeleteTodos('incomplete'));
        document.getElementById('bulk-complete-incomplete-todos')?.addEventListener('click', () => bulkCompleteTodos());

        document.getElementById('select-all-completed-todos')?.addEventListener('change', (e) => toggleSelectAll(e.target, 'completed-todos-list'));
        document.getElementById('bulk-delete-completed-todos')?.addEventListener('click', () => bulkDeleteTodos('completed'));
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
        // Event listeners for bulk actions - Facts
        document.getElementById('select-all-confirmed-facts')?.addEventListener('change', (e) => toggleSelectAll(e.target, 'confirmed-facts-list'));
        document.getElementById('bulk-delete-confirmed-facts')?.addEventListener('click', () => bulkDeleteFacts('confirmed'));
        document.getElementById('bulk-unconfirm-selected-facts')?.addEventListener('click', () => bulkUnconfirmFacts());

        document.getElementById('select-all-unconfirmed-facts')?.addEventListener('change', (e) => toggleSelectAll(e.target, 'unconfirmed-facts-list'));
        document.getElementById('bulk-delete-unconfirmed-facts')?.addEventListener('click', () => bulkDeleteFacts('unconfirmed'));
        document.getElementById('bulk-confirm-unconfirmed-facts')?.addEventListener('click', () => bulkConfirmFacts());
    }

    // --- Conversations Page (for conversations.html) ---
    if (conversationsContainer) {
        loadConversations(); // Initial load
        const conversationSearchInput = document.getElementById('conversation-search');
        if (conversationSearchInput) {
            conversationSearchInput.addEventListener('input', () => {
                clearTimeout(conversationSearchInput.searchTimeout);
                conversationSearchInput.searchTimeout = setTimeout(() => {
                    currentPageConversations = 1;
                    loadConversations(conversationSearchInput.value);
                }, 300);
            });
        }
    }
});

let currentPageConversations = 1;
const conversationsLimit = 10;

let currentPageTodos = 1;
const todosLimit = 10;

async function loadTodos(searchTerm = '') {
    const incompleteTodosList = document.getElementById('incomplete-todos-list');
    const completedTodosList = document.getElementById('completed-todos-list');
    const todosContainer = document.getElementById('todos-container');

    try {
        const response = await fetch(`/api/todos?page=${currentPageTodos}&limit=${todosLimit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const todos = data.todos;
        const totalPages = data.totalPages;

        incompleteTodosList.innerHTML = '';
        completedTodosList.innerHTML = '';

        document.getElementById('select-all-incomplete-todos') && (document.getElementById('select-all-incomplete-todos').checked = false);
        document.getElementById('select-all-completed-todos') && (document.getElementById('select-all-completed-todos').checked = false);

        const incompleteTodos = todos.filter(todo => !todo.completed);
        const completedTodos = todos.filter(todo => todo.completed);

        if (incompleteTodos.length === 0) {
            incompleteTodosList.innerHTML = '<p>No incomplete todos found.</p>';
        } else {
            const ul = document.createElement('ul');
            incompleteTodos.forEach(todo => {
                const li = document.createElement('li');
                li.dataset.todoId = todo.id;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('todo-checkbox');
                checkbox.dataset.todoId = todo.id;
                li.appendChild(checkbox);

                const textSpan = document.createElement('span');
                textSpan.textContent = todo.text;
                textSpan.classList.add('item-text');
                li.appendChild(textSpan);

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
                li.dataset.todoId = todo.id;
                li.classList.add('completed');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('todo-checkbox');
                checkbox.dataset.todoId = todo.id;
                li.appendChild(checkbox);

                const textSpan = document.createElement('span');
                textSpan.textContent = todo.text;
                textSpan.classList.add('item-text');
                li.appendChild(textSpan);

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

function toggleSelectAll(sourceCheckbox, listId) {
    const listContainer = document.getElementById(listId);
    if (!listContainer) return;
    const checkboxes = listContainer.querySelectorAll('input[type="checkbox"].todo-checkbox, input[type="checkbox"].fact-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = sourceCheckbox.checked;
    });
}

async function bulkDeleteTodos(type) {
    const listId = type === 'incomplete' ? 'incomplete-todos-list' : 'completed-todos-list';
    const listContainer = document.getElementById(listId);
    if (!listContainer) return;

    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].todo-checkbox:checked'))
        .map(cb => cb.dataset.todoId);

    if (selectedIds.length === 0) {
        alert('Please select at least one todo to delete.');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected todo(s)?`)) {
        return;
    }

    try {
        const response = await fetch('/api/todos/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todoIds: selectedIds })
        });
        if (response.ok) {
            loadTodos(document.getElementById('todo-search')?.value || '');
        } else {
            const errorData = await response.json();
            alert(`Failed to delete selected todos: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error bulk deleting todos:', error);
        alert('Error bulk deleting todos.');
    }
}

async function bulkCompleteTodos() {
    const listContainer = document.getElementById('incomplete-todos-list');
    if (!listContainer) return;

    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].todo-checkbox:checked'))
        .map(cb => cb.dataset.todoId);

    if (selectedIds.length === 0) {
        alert('Please select at least one todo to complete.');
        return;
    }

    if (!confirm(`Are you sure you want to complete ${selectedIds.length} selected todo(s)?`)) {
        return;
    }

    try {
        const response = await fetch('/api/todos/bulk-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todoIds: selectedIds })
        });
        if (response.ok) {
            loadTodos(document.getElementById('todo-search')?.value || '');
        } else {
            const errorData = await response.json();
            alert(`Failed to complete selected todos: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error bulk completing todos:', error);
        alert('Error bulk completing todos.');
    }
}

async function bulkDeleteFacts(type) {
    const listId = type === 'confirmed' ? 'confirmed-facts-list' : 'unconfirmed-facts-list';
    const listContainer = document.getElementById(listId);
    if (!listContainer) return;

    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].fact-checkbox:checked'))
        .map(cb => cb.dataset.factId);

    if (selectedIds.length === 0) {
        alert('Please select at least one fact to delete.');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected fact(s)?`)) {
        return;
    }

    try {
        const response = await fetch('/api/facts/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ factIds: selectedIds })
        });
        if (response.ok) {
            loadFacts(document.getElementById('fact-search')?.value || '');
        } else {
            const errorData = await response.json();
            alert(`Failed to delete selected facts: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error bulk deleting facts:', error);
        alert('Error bulk deleting facts.');
    }
}

async function bulkConfirmFacts() {
    const listContainer = document.getElementById('unconfirmed-facts-list');
    if (!listContainer) return;

    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].fact-checkbox:checked'))
        .map(cb => cb.dataset.factId);

    if (selectedIds.length === 0) {
        alert('Please select at least one fact to confirm.');
        return;
    }

    if (!confirm(`Are you sure you want to confirm ${selectedIds.length} selected fact(s)?`)) {
        return;
    }

    try {
        const response = await fetch('/api/facts/bulk-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ factIds: selectedIds })
        });
        if (response.ok) {
            loadFacts(document.getElementById('fact-search')?.value || '');
        } else {
            const errorData = await response.json();
            alert(`Failed to confirm selected facts: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error bulk confirming facts:', error);
        alert('Error bulk confirming facts.');
    }
}

async function bulkUnconfirmFacts() {
    const listContainer = document.getElementById('confirmed-facts-list');
    if (!listContainer) return;

    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].fact-checkbox:checked'))
        .map(cb => cb.dataset.factId);

    if (selectedIds.length === 0) {
        alert('Please select at least one fact to unconfirm.');
        return;
    }

    if (!confirm(`Are you sure you want to unconfirm ${selectedIds.length} selected fact(s)?`)) {
        return;
    }

    try {
        const response = await fetch('/api/facts/bulk-unconfirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ factIds: selectedIds })
        });
        if (response.ok) {
            loadFacts(document.getElementById('fact-search')?.value || '');
        } else {
            const errorData = await response.json();
            alert(`Failed to unconfirm selected facts: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error bulk unconfirming facts:', error);
        alert('Error bulk unconfirming facts.');
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
    const originalContent = li.innerHTML;
    li.innerHTML = '';

    const form = document.createElement('form');
    form.classList.add('edit-fact-form');
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
        li.innerHTML = originalContent;
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
const limit = 10;

async function loadFacts(searchTerm = '') {
    await loadConfirmedFacts(searchTerm);
    await loadUnconfirmedFacts(searchTerm);
}

async function loadConfirmedFacts(searchTerm = '') {
    const confirmedFactsList = document.getElementById('confirmed-facts-list');
    try {
        const response = await fetch(`/api/facts?confirmed=true&page=${currentPageConfirmed}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const facts = data.facts;
        const totalPages = data.totalPages;

        confirmedFactsList.innerHTML = '';
        document.getElementById('select-all-confirmed-facts') && (document.getElementById('select-all-confirmed-facts').checked = false);

        if (facts.length === 0) {
            confirmedFactsList.innerHTML = searchTerm ? '<p>No confirmed facts match your search.</p>' : '<p>No confirmed facts found.</p>';
        } else {
            const ul = document.createElement('ul');
            facts.forEach(fact => {
                const li = document.createElement('li');
                li.dataset.factId = fact.id;
                li.classList.add('confirmed');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('fact-checkbox');
                checkbox.dataset.factId = fact.id;
                li.appendChild(checkbox);

                const textSpan = document.createElement('span');
                textSpan.textContent = fact.text;
                textSpan.classList.add('item-text');
                li.appendChild(textSpan);

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
        const response = await fetch(`/api/facts?confirmed=false&page=${currentPageUnconfirmed}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const facts = data.facts;
        const totalPages = data.totalPages;

        unconfirmedFactsList.innerHTML = '';
        document.getElementById('select-all-unconfirmed-facts') && (document.getElementById('select-all-unconfirmed-facts').checked = false);

        if (facts.length === 0) {
            unconfirmedFactsList.innerHTML = searchTerm ? '<p>No unconfirmed facts match your search.</p>' : '<p>No unconfirmed facts found.</p>';
        } else {
            const ul = document.createElement('ul');
            facts.forEach(fact => {
                const li = document.createElement('li');
                li.dataset.factId = fact.id;
                li.classList.add('unconfirmed');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('fact-checkbox');
                checkbox.dataset.factId = fact.id;
                li.appendChild(checkbox);

                const textSpan = document.createElement('span');
                textSpan.textContent = fact.text;
                textSpan.classList.add('item-text');
                li.appendChild(textSpan);

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
    const originalContent = li.innerHTML;
    li.innerHTML = '';

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
        li.innerHTML = originalContent;
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

async function loadConversations(searchTerm = '') {
    const conversationsContainer = document.getElementById('conversations-container');
    try {
        const response = await fetch(`/api/conversations?page=${currentPageConversations}&limit=${conversationsLimit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const conversations = data.conversations;
        const totalPages = data.totalPages;

        conversationsContainer.innerHTML = '';

        if (conversations.length === 0) {
            conversationsContainer.innerHTML = searchTerm ? '<p>No conversations match your search.</p>' : '<p>No conversations found.</p>';
        } else {
            const ul = document.createElement('ul');
            conversations.forEach(conversation => {
                const li = document.createElement('li');
                li.classList.add('conversation-item');
                li.dataset.conversationId = conversation.id;

                const triggerContainer = document.createElement('div');
                triggerContainer.classList.add('trigger-container');

                const title = document.createElement('h3');
                title.textContent = conversation.short_summary || 'Conversation';
                triggerContainer.appendChild(title);

                const state = document.createElement('p');
                state.textContent = `State: ${conversation.state}`;
                triggerContainer.appendChild(state);

                const timeInfo = document.createElement('p');
                const startTime = new Date(conversation.start_time).toLocaleString();
                const endTime = conversation.end_time ? new Date(conversation.end_time).toLocaleString() : 'Ongoing';
                timeInfo.textContent = `Time: ${startTime} - ${endTime}`;
                triggerContainer.appendChild(timeInfo);

                li.appendChild(triggerContainer);

                const panel = document.createElement('div');
                panel.classList.add('accordion-panel');
                panel.innerHTML = (typeof markdownit === 'function' ? markdownit().render(conversation.summary || 'No detailed content available.') : (conversation.summary || 'No detailed content available.'));

                if (conversation.state !== 'CAPTURING') {
                    const icon = document.createElement('span');
                    icon.classList.add('accordion-icon');
                    icon.innerHTML = '&#8250;';
                    li.appendChild(icon);
                    li.appendChild(panel);

                    li.addEventListener('click', (e) => {
                        if (e.target.tagName === 'A' && panel.contains(e.target)) {
                            return;
                        }
                        li.classList.toggle('active');
                        const currentPanel = li.querySelector('.accordion-panel');
                        if (currentPanel.style.maxHeight) {
                            currentPanel.style.maxHeight = null;
                        } else {
                            currentPanel.style.maxHeight = currentPanel.scrollHeight + "px";
                        }
                    });
                } else {
                    li.style.cursor = 'default';
                }
                ul.appendChild(li);
            });
            conversationsContainer.appendChild(ul);
        }

        let paginationContainer = conversationsContainer.parentNode.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.remove();
        }
        paginationContainer = document.createElement('div');
        paginationContainer.classList.add('pagination-container');

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPageConversations === 1;
        prevButton.onclick = () => {
            if (currentPageConversations > 1) {
                currentPageConversations--;
                loadConversations(document.getElementById('conversation-search')?.value || '');
            }
        };
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageConversations} of ${totalPages || 1}`;
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageConversations >= (totalPages || 1);
        nextButton.onclick = () => {
            if (currentPageConversations < (totalPages || 1)) {
                currentPageConversations++;
                loadConversations(document.getElementById('conversation-search')?.value || '');
            }
        };
        paginationContainer.appendChild(nextButton);

        conversationsContainer.parentNode.insertBefore(paginationContainer, conversationsContainer.nextSibling);

    } catch (error) {
        console.error('Failed to load conversations:', error);
        conversationsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p><p>Could not load conversations. Check the console for more details.</p>`;
    }
}