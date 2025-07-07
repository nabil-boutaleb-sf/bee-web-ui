document.addEventListener('DOMContentLoaded', () => {
    const confirmedFactsContainer = document.getElementById('confirmed-facts-container');
    const unconfirmedFactsContainer = document.getElementById('unconfirmed-facts-container');

    async function loadFacts(confirmed, container) {
        try {
            // The 'confirmed' parameter is a boolean, so we don't need to check if it's true or false
            const response = await fetch(`/test-api/facts?confirmed=${confirmed}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const facts = data.facts;

            // Clear the loading message
            container.innerHTML = '';

            if (facts.length === 0) {
                container.innerHTML = `<p>No ${confirmed ? 'confirmed' : 'unconfirmed'} facts found.</p>`;
                return;
            }

            const ul = document.createElement('ul');
            facts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact.text;
                ul.appendChild(li);
            });
            container.appendChild(ul);
        } catch (error) {
            console.error(`Failed to load ${confirmed ? 'confirmed' : 'unconfirmed'} facts:`, error);
            container.innerHTML = `<p>Error loading facts: ${error.message}.</p>`;
        }
    }

    loadFacts(true, confirmedFactsContainer);
    loadFacts(false, unconfirmedFactsContainer);
});