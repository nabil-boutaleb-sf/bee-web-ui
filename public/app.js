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
        // Initial load for both lists
        fetchIncompleteTodos(1, '');
        fetchCompletedTodos(1, '');

        const todoSearchInput = document.getElementById('todo-search');
        if (todoSearchInput) {
            todoSearchInput.addEventListener('input', () => {
                clearTimeout(todoSearchInput.searchTimeout);
                todoSearchInput.searchTimeout = setTimeout(() => {
                    const searchTerm = todoSearchInput.value;
                    fetchIncompleteTodos(1, searchTerm); // Reset to page 1 for new search
                    fetchCompletedTodos(1, searchTerm);  // Reset to page 1 for new search
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
        loadFacts();
        const factSearchInput = document.getElementById('fact-search');
        if (factSearchInput) {
            factSearchInput.addEventListener('input', () => {
                clearTimeout(factSearchInput.searchTimeout);
                factSearchInput.searchTimeout = setTimeout(() => {
                    currentPageConfirmed = 1;
                    currentPageUnconfirmed = 1;
                    loadFacts(factSearchInput.value);
                }, 300);
            });
        }
        document.getElementById('select-all-confirmed-facts')?.addEventListener('change', (e) => toggleSelectAll(e.target, 'confirmed-facts-list'));
        document.getElementById('bulk-delete-confirmed-facts')?.addEventListener('click', () => bulkDeleteFacts('confirmed'));
        document.getElementById('bulk-unconfirm-selected-facts')?.addEventListener('click', () => bulkUnconfirmFacts());

        document.getElementById('select-all-unconfirmed-facts')?.addEventListener('change', (e) => toggleSelectAll(e.target, 'unconfirmed-facts-list'));
        document.getElementById('bulk-delete-unconfirmed-facts')?.addEventListener('click', () => bulkDeleteFacts('unconfirmed'));
        document.getElementById('bulk-confirm-unconfirmed-facts')?.addEventListener('click', () => bulkConfirmFacts());
    }

    // --- Conversations Page (for conversations.html) ---
    if (conversationsContainer) {
        loadConversations();
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

// --- Todos Page Specific Logic (Server-Side Pagination) ---
const todosLimit = 10;

let currentPageIncompleteTodos = 1;
let totalPagesIncomplete = 1;
// No longer storing allIncompleteTodosData globally; it's fetched per page.

let currentPageCompletedTodos = 1;
let totalPagesCompleted = 1;
// No longer storing allCompletedTodosData globally.

let currentIncompleteSearchTerm = '';
let currentCompletedSearchTerm = '';


async function fetchIncompleteTodos(page, searchTerm) {
    currentPageIncompleteTodos = page;
    currentIncompleteSearchTerm = searchTerm;
    const listDiv = document.getElementById('incomplete-todos-list');
    try {
        const response = await fetch(`/api/todos?completed=false&page=${currentPageIncompleteTodos}&limit=${todosLimit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        totalPagesIncomplete = data.totalPages || 1;
        renderSpecificTodoListUI(data.todos || [], 'incomplete-todos-list', currentPageIncompleteTodos, totalPagesIncomplete, 'incomplete', false);
    } catch (error) {
        console.error('Failed to fetch incomplete todos:', error);
        if(listDiv) listDiv.innerHTML = '<p>Error loading incomplete todos. Check console.</p>';
        renderSpecificTodoListUI([], 'incomplete-todos-list', currentPageIncompleteTodos, 1, 'incomplete', false); // Render empty state with pagination
    }
}

async function fetchCompletedTodos(page, searchTerm) {
    currentPageCompletedTodos = page;
    currentCompletedSearchTerm = searchTerm;
    const listDiv = document.getElementById('completed-todos-list');
    try {
        const response = await fetch(`/api/todos?completed=true&page=${currentPageCompletedTodos}&limit=${todosLimit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        totalPagesCompleted = data.totalPages || 1;
        renderSpecificTodoListUI(data.todos || [], 'completed-todos-list', currentPageCompletedTodos, totalPagesCompleted, 'completed', true);
    } catch (error) {
        console.error('Failed to fetch completed todos:', error);
        if(listDiv) listDiv.innerHTML = '<p>Error loading completed todos. Check console.</p>';
        renderSpecificTodoListUI([], 'completed-todos-list', currentPageCompletedTodos, 1, 'completed', true); // Render empty state with pagination
    }
}

function renderSpecificTodoListUI(todosOnPage, listId, currentPage, totalPages, type, isCompletedList) {
    const listContainer = document.getElementById(listId);
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const selectAllCheckbox = document.getElementById(`select-all-${type}-todos`);
    if (selectAllCheckbox) selectAllCheckbox.checked = false;

    if (todosOnPage.length === 0) {
        listContainer.innerHTML = `<p>No ${type} todos found.</p>`;
    } else {
        const ul = document.createElement('ul');
        todosOnPage.forEach(todo => {
            const li = document.createElement('li');
            li.dataset.todoId = todo.id;
            if (isCompletedList) li.classList.add('completed');

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

            if (!isCompletedList) {
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
            }

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.classList.add('icon-btn', 'delete-btn');
            deleteButton.onclick = () => deleteTodo(todo.id);
            buttonContainer.appendChild(deleteButton);

            li.appendChild(buttonContainer);
            ul.appendChild(li);
        });
        listContainer.appendChild(ul);
    }

    const paginationPlaceholderId = `${type}-todos-pagination`;
    const paginationPlaceholder = document.getElementById(paginationPlaceholderId);
    if (paginationPlaceholder) {
        paginationPlaceholder.innerHTML = '';
        createPaginationControlsUI(type, currentPage, totalPages, paginationPlaceholder);
    } else {
        console.error(`Pagination placeholder ${paginationPlaceholderId} not found.`);
    }
}

function createPaginationControlsUI(listType, currentPage, totalPages, appendToElement) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (listType === 'incomplete') {
            if (currentPageIncompleteTodos > 1) {
                fetchIncompleteTodos(currentPageIncompleteTodos - 1, currentIncompleteSearchTerm);
            }
        } else if (listType === 'completed') {
            if (currentPageCompletedTodos > 1) {
                fetchCompletedTodos(currentPageCompletedTodos - 1, currentCompletedSearchTerm);
            }
        }
    };
    paginationContainer.appendChild(prevButton);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationContainer.appendChild(pageInfo);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.onclick = () => {
        if (listType === 'incomplete') {
            if (currentPageIncompleteTodos < totalPagesIncomplete) {
                fetchIncompleteTodos(currentPageIncompleteTodos + 1, currentIncompleteSearchTerm);
            }
        } else if (listType === 'completed') {
            if (currentPageCompletedTodos < totalPagesCompleted) {
                fetchCompletedTodos(currentPageCompletedTodos + 1, currentCompletedSearchTerm);
            }
        }
    };
    paginationContainer.appendChild(nextButton);
    appendToElement.appendChild(paginationContainer);
}

// --- Generic Helper Functions & Todo Item Actions ---
function toggleSelectAll(sourceCheckbox, listId) {
    const listContainer = document.getElementById(listId);
    if (!listContainer) return;
    const checkboxes = listContainer.querySelectorAll('input[type="checkbox"].todo-checkbox, input[type="checkbox"].fact-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = sourceCheckbox.checked);
}

async function refreshTodoLists() {
    // After an action, refresh both lists with their current page and search term
    // This is simpler than trying to guess which list was affected and what its new totalPages might be.
    // The backend will provide the correct totalPages for the current state.
    const searchTerm = document.getElementById('todo-search')?.value || '';
    fetchIncompleteTodos(currentPageIncompleteTodos, searchTerm);
    fetchCompletedTodos(currentPageCompletedTodos, searchTerm);
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected todo(s)?`)) return;

    try {
        const response = await fetch('/api/todos/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todoIds: selectedIds })
        });
        if (response.ok) {
            refreshTodoLists();
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
    if (!confirm(`Are you sure you want to complete ${selectedIds.length} selected todo(s)?`)) return;

    try {
        const response = await fetch('/api/todos/bulk-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todoIds: selectedIds })
        });
        if (response.ok) {
            refreshTodoLists();
        } else {
            const errorData = await response.json();
            alert(`Failed to complete selected todos: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error bulk completing todos:', error);
        alert('Error bulk completing todos.');
    }
}

async function completeTodo(todoId) {
    try {
        const response = await fetch(`/api/todos/${todoId}/complete`, { method: 'PUT' });
        if (response.ok) {
            refreshTodoLists();
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
            refreshTodoLists();
        } else {
            alert('Failed to delete todo.');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Error deleting todo.');
    }
}

function editTodo(li, todoId, currentText) {
    li.innerHTML = '';

    const form = document.createElement('form');
    form.classList.add('edit-fact-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await updateTodo(todoId, input.value);
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
        refreshTodoLists(); // Simplest way to restore is to re-fetch current page
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (response.ok) {
            refreshTodoLists();
        } else {
            alert('Failed to update todo.');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Error updating todo.');
    }
}


// --- Facts Page Logic (mostly unchanged) ---
let currentPageConfirmed = 1;
let currentPageUnconfirmed = 1;
const factsLimit = 10;

async function loadFacts(searchTerm = '') {
    await loadConfirmedFacts(searchTerm);
    await loadUnconfirmedFacts(searchTerm);
}

async function loadConfirmedFacts(searchTerm = '') {
    const confirmedFactsList = document.getElementById('confirmed-facts-list');
    try {
        const response = await fetch(`/api/facts?confirmed=true&page=${currentPageConfirmed}&limit=${factsLimit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

        let paginationContainer = confirmedFactsList.querySelector('.pagination-container');
        if(paginationContainer) paginationContainer.remove();

        paginationContainer = document.createElement('div');
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
        pageInfo.textContent = `Page ${currentPageConfirmed} of ${totalPages || 1}`;
        paginationContainer.appendChild(pageInfo);
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageConfirmed >= (totalPages || 1);
        nextButton.onclick = () => {
            currentPageConfirmed++;
            loadConfirmedFacts(document.getElementById('fact-search')?.value || '');
        };
        paginationContainer.appendChild(nextButton);
        confirmedFactsList.appendChild(paginationContainer);

    } catch (error) {
        console.error('Failed to load confirmed facts:', error);
        if(confirmedFactsList) confirmedFactsList.innerHTML = '<p>Error loading confirmed facts. Check console.</p>';
    }
}

async function loadUnconfirmedFacts(searchTerm = '') {
    const unconfirmedFactsList = document.getElementById('unconfirmed-facts-list');
    try {
        const response = await fetch(`/api/facts?confirmed=false&page=${currentPageUnconfirmed}&limit=${factsLimit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

        let paginationContainer = unconfirmedFactsList.querySelector('.pagination-container');
        if(paginationContainer) paginationContainer.remove();
        paginationContainer = document.createElement('div');
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
        pageInfo.textContent = `Page ${currentPageUnconfirmed} of ${totalPages || 1}`;
        paginationContainer.appendChild(pageInfo);
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageUnconfirmed >= (totalPages || 1);
        nextButton.onclick = () => {
            currentPageUnconfirmed++;
            loadUnconfirmedFacts(document.getElementById('fact-search')?.value || '');
        };
        paginationContainer.appendChild(nextButton);
        unconfirmedFactsList.appendChild(paginationContainer);

    } catch (error) {
        console.error('Failed to load unconfirmed facts:', error);
        if(unconfirmedFactsList) unconfirmedFactsList.innerHTML = '<p>Error loading unconfirmed facts. Check console.</p>';
    }
}

async function deleteFact(factId) {
    try {
        const response = await fetch(`/api/facts/${factId}`, { method: 'DELETE' });
        if (response.ok) loadFacts(document.getElementById('fact-search')?.value || '');
        else alert('Failed to delete fact.');
    } catch (error) { console.error('Error deleting fact:', error); alert('Error deleting fact.'); }
}

async function confirmFact(factId) {
    try {
        const response = await fetch(`/api/facts/${factId}/confirm`, { method: 'PUT' });
        if (response.ok) loadFacts(document.getElementById('fact-search')?.value || '');
        else alert('Failed to confirm fact.');
    } catch (error) { console.error('Error confirming fact:', error); alert('Error confirming fact.'); }
}

async function unconfirmFact(factId) {
    try {
        const response = await fetch(`/api/facts/${factId}/unconfirm`, { method: 'PUT' });
        if (response.ok) loadFacts(document.getElementById('fact-search')?.value || '');
        else alert('Failed to unconfirm fact.');
    } catch (error) { console.error('Error unconfirming fact:', error); alert('Error unconfirming fact.'); }
}

async function updateFact(factId, text) {
    try {
        const response = await fetch(`/api/facts/${factId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (response.ok) loadFacts(document.getElementById('fact-search')?.value || '');
        else alert('Failed to update fact.');
    } catch (error) { console.error('Error updating fact:', error); alert('Error updating fact.'); }
}

function editFact(li, factId, currentText) {
    const originalContent = li.innerHTML;
    li.innerHTML = '';
    const form = document.createElement('form');
    form.classList.add('edit-fact-form');
    form.onsubmit = (e) => { e.preventDefault(); updateFact(factId, input.value); };
    const input = document.createElement('input');
    input.type = 'text'; input.value = currentText; input.classList.add('edit-fact-input');
    form.appendChild(input);
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    const saveButton = document.createElement('button');
    saveButton.innerHTML = '<i class="fas fa-save"></i>'; saveButton.type = 'submit';
    saveButton.classList.add('icon-btn', 'confirm-btn');
    buttonContainer.appendChild(saveButton);
    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = '<i class="fas fa-times"></i>'; cancelButton.type = 'button';
    cancelButton.classList.add('icon-btn', 'delete-btn');
    cancelButton.onclick = () => {
        li.innerHTML = originalContent;
        const editBtn = li.querySelector('.edit-btn'); if (editBtn) editBtn.onclick = () => editFact(li, factId, currentText);
        const deleteBtn = li.querySelector('.delete-btn'); if (deleteBtn) deleteBtn.onclick = () => deleteFact(factId);
        const confirmBtn = li.querySelector('.confirm-btn'); if (confirmBtn) confirmBtn.onclick = () => confirmFact(factId);
        const unconfirmBtn = li.querySelector('.unconfirm-btn'); if (unconfirmBtn) unconfirmBtn.onclick = () => unconfirmFact(factId);
    };
    buttonContainer.appendChild(cancelButton);
    form.appendChild(buttonContainer);
    li.appendChild(form);
    input.focus();
}

async function bulkDeleteFacts(type) {
    const listId = type === 'confirmed' ? 'confirmed-facts-list' : 'unconfirmed-facts-list';
    const listContainer = document.getElementById(listId);
    if (!listContainer) return;
    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].fact-checkbox:checked')).map(cb => cb.dataset.factId);
    if (selectedIds.length === 0) { alert('Please select at least one fact to delete.'); return; }
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected fact(s)?`)) return;
    try {
        const response = await fetch('/api/facts/bulk-delete', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ factIds: selectedIds })
        });
        if (response.ok) loadFacts(document.getElementById('fact-search')?.value || '');
        else { const errorData = await response.json(); alert(`Failed to delete selected facts: ${errorData.message || response.statusText}`); }
    } catch (error) { console.error('Error bulk deleting facts:', error); alert('Error bulk deleting facts.'); }
}

async function bulkConfirmFacts() {
    const listContainer = document.getElementById('unconfirmed-facts-list');
    if (!listContainer) return;
    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].fact-checkbox:checked')).map(cb => cb.dataset.factId);
    if (selectedIds.length === 0) { alert('Please select at least one fact to confirm.'); return; }
    if (!confirm(`Are you sure you want to confirm ${selectedIds.length} selected fact(s)?`)) return;
    try {
        const response = await fetch('/api/facts/bulk-confirm', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ factIds: selectedIds })
        });
        if (response.ok) loadFacts(document.getElementById('fact-search')?.value || '');
        else { const errorData = await response.json(); alert(`Failed to confirm selected facts: ${errorData.message || response.statusText}`); }
    } catch (error) { console.error('Error bulk confirming facts:', error); alert('Error bulk confirming facts.'); }
}

async function bulkUnconfirmFacts() {
    const listContainer = document.getElementById('confirmed-facts-list');
    if (!listContainer) return;
    const selectedIds = Array.from(listContainer.querySelectorAll('input[type="checkbox"].fact-checkbox:checked')).map(cb => cb.dataset.factId);
    if (selectedIds.length === 0) { alert('Please select at least one fact to unconfirm.'); return; }
    if (!confirm(`Are you sure you want to unconfirm ${selectedIds.length} selected fact(s)?`)) return;
    try {
        const response = await fetch('/api/facts/bulk-unconfirm', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ factIds: selectedIds })
        });
        if (response.ok) loadFacts(document.getElementById('fact-search')?.value || '');
        else { const errorData = await response.json(); alert(`Failed to unconfirm selected facts: ${errorData.message || response.statusText}`); }
    } catch (error) { console.error('Error bulk unconfirming facts:', error); alert('Error bulk unconfirming facts.'); }
}

// --- Conversations Page Logic (mostly unchanged) ---
let currentPageConversations = 1;
const conversationsLimit = 10;

async function loadConversations(searchTerm = '') {
    const conversationsListContainer = document.getElementById('conversations-list');
    const conversationsContainer = document.getElementById('conversations-container');

    try {
        const response = await fetch(`/api/conversations?page=${currentPageConversations}&limit=${conversationsLimit}&search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const conversations = data.conversations;
        const totalPages = data.totalPages;

        const targetListDisplay = conversationsListContainer || conversationsContainer; // Prefer specific list, fallback to main
        if (targetListDisplay) targetListDisplay.innerHTML = '';

        if (conversations.length === 0) {
            if(targetListDisplay) targetListDisplay.innerHTML = searchTerm ? '<p>No conversations match your search.</p>' : '<p>No conversations found.</p>';
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
                        if (e.target.tagName === 'A' && panel.contains(e.target)) return;
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
            if(targetListDisplay) targetListDisplay.appendChild(ul);
        }

        const paginationTargetElement = conversationsContainer; // Pagination always relative to main container
        let paginationDiv = paginationTargetElement.querySelector('.pagination-container.conversations-pagination');
        if (paginationDiv) paginationDiv.remove();

        paginationDiv = document.createElement('div');
        paginationDiv.classList.add('pagination-container', 'conversations-pagination');
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPageConversations === 1;
        prevButton.onclick = () => {
            if (currentPageConversations > 1) {
                currentPageConversations--;
                loadConversations(document.getElementById('conversation-search')?.value || '');
            }
        };
        paginationDiv.appendChild(prevButton);
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageConversations} of ${totalPages || 1}`;
        paginationDiv.appendChild(pageInfo);
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageConversations >= (totalPages || 1);
        nextButton.onclick = () => {
            if (currentPageConversations < (totalPages || 1)) {
                currentPageConversations++;
                loadConversations(document.getElementById('conversation-search')?.value || '');
            }
        };
        paginationDiv.appendChild(nextButton);

        // Ensure pagination is appended after the list container if it exists, or just to the main container
        if (conversationsListContainer && conversationsListContainer.nextSibling) {
             paginationTargetElement.insertBefore(paginationDiv, conversationsListContainer.nextSibling);
        } else {
            paginationTargetElement.appendChild(paginationDiv);
        }

    } catch (error) {
        console.error('Failed to load conversations:', error);
        const targetErrorDiv = conversationsListContainer || conversationsContainer;
        if(targetErrorDiv) targetErrorDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p><p>Could not load conversations. Check console.</p>`;
    }
}
