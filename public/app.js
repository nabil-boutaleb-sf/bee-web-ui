document.addEventListener('DOMContentLoaded', async () => {
    const authStatusDiv = document.getElementById('auth-status');
    const factsContainer = document.getElementById('facts-container');

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

    // --- Facts Page (for facts.html) ---
    if (factsContainer) {
        loadFacts();
    }
});

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

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
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
                confirmButton.textContent = 'Confirm';
                confirmButton.classList.add('confirm-btn');
                confirmButton.onclick = () => confirmFact(fact.id);
                buttonContainer.appendChild(confirmButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
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
