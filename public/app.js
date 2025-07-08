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
    }

    // --- Facts Page (for facts.html) ---
    if (factsContainer) {
        loadFacts();
    }

    // --- Conversations Page (for conversations.html) ---
    if (conversationsContainer) {
        loadConversations();
    }
});


let currentPageTodos = 1;
const todosLimit = 10;

async function loadTodos() {
    const incompleteTodosList = document.getElementById('incomplete-todos-list');
    const completedTodosList = document.getElementById('completed-todos-list');
    const todosContainer = document.getElementById('todos-container');

    try {
        const response = await fetch(`/api/todos?page=${currentPageTodos}&limit=${todosLimit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const todos = data.todos;

        incompleteTodosList.innerHTML = '';
        completedTodosList.innerHTML = '';

        const incompleteTodos = todos.filter(todo => !todo.completed);
        const completedTodos = todos.filter(todo => todo.completed);

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
            loadTodos();
        };
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageTodos} of ${data.totalPages}`;
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = todos.length < todosLimit;
        nextButton.onclick = () => {
            currentPageTodos++;
            loadTodos();
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
            loadTodos();
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
            loadTodos();
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
            loadTodos();
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

async function loadFacts() {
    await loadConfirmedFacts();
    await loadUnconfirmedFacts();
}

async function loadConfirmedFacts() {
    const confirmedFactsList = document.getElementById('confirmed-facts-list');
    try {
        const response = await fetch(`/api/facts?confirmed=true&page=${currentPageConfirmed}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const facts = data.facts;

        confirmedFactsList.innerHTML = '';

        if (facts.length === 0) {
            confirmedFactsList.innerHTML = '<p>No confirmed facts found.</p>';
        } else {
            const ul = document.createElement('ul');
            facts.forEach(fact => {
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
            loadConfirmedFacts();
        };
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageConfirmed} of ${data.totalPages}`;
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = facts.length < limit;
        nextButton.onclick = () => {
            currentPageConfirmed++;
            loadConfirmedFacts();
        };
        paginationContainer.appendChild(nextButton);

        confirmedFactsList.appendChild(paginationContainer);

    } catch (error) {
        console.error('Failed to load confirmed facts:', error);
        confirmedFactsList.innerHTML = '<p>Error loading confirmed facts. Check the console for details.</p>';
    }
}

async function loadUnconfirmedFacts() {
    const unconfirmedFactsList = document.getElementById('unconfirmed-facts-list');
    try {
        const response = await fetch(`/api/facts?confirmed=false&page=${currentPageUnconfirmed}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const facts = data.facts;

        unconfirmedFactsList.innerHTML = '';

        if (facts.length === 0) {
            unconfirmedFactsList.innerHTML = '<p>No unconfirmed facts found.</p>';
        } else {
            const ul = document.createElement('ul');
            facts.forEach(fact => {
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
            loadUnconfirmedFacts();
        };
        paginationContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPageUnconfirmed} of ${data.totalPages}`;
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = facts.length < limit;
        nextButton.onclick = () => {
            currentPageUnconfirmed++;
            loadUnconfirmedFacts();
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
            loadFacts(); // Reload both lists after deleting
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
            loadFacts(); // Reload both lists after confirming
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
            loadFacts(); // Reload both lists after unconfirming
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
            loadFacts();
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

async function loadConversations() {
    const conversationsContainer = document.getElementById('conversations-container');

    try {
        // Explicitly check if the markdown-it library is loaded
        if (typeof window.markdownit !== 'function') {
            throw new Error('Markdown rendering library failed to load. Please check your network connection or ad-blocker.');
        }

        // Initialize markdown-it
        const md = window.markdownit({
            html: true, // Enable HTML tags in source
            breaks: true, // Convert '\n' in paragraphs into <br>
            linkify: true // Autoconvert URL-like text to links
        });

        const response = await fetch('/api/conversations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const conversations = await response.json();

        conversationsContainer.innerHTML = '';

        if (conversations.length === 0) {
            conversationsContainer.innerHTML = '<p>No conversations found.</p>';
        } else {
            const ul = document.createElement('ul');
            conversations.forEach(conversation => {
                const li = document.createElement('li');
                li.classList.add('conversation-item');
                li.dataset.conversationId = conversation.id;

                // --- Visible Trigger Area ---
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

                // --- Collapsible Panel ---
                const panel = document.createElement('div');
                panel.classList.add('accordion-panel');
                panel.innerHTML = md.render(conversation.summary || 'No detailed content available.');
                
                if (conversation.state !== 'CAPTURING') {
                    const icon = document.createElement('span');
                    icon.classList.add('accordion-icon');
                    icon.innerHTML = '&#8250;'; // Chevron right
                    li.appendChild(icon);
                    li.appendChild(panel);

                    li.addEventListener('click', () => {
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
    } catch (error) {
        console.error('Failed to load conversations:', error);
        conversationsContainer.innerHTML = `<p style="color: red;">${error.message}</p><p>Check the console for more details.</p>`;
    }
}
