document.addEventListener('DOMContentLoaded', () => {
    const factsContainer = document.getElementById('facts-container');

    async function loadFacts() {
        try {
            const response = await fetch('/api/facts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const facts = await response.json();

            // Clear the loading message
            factsContainer.innerHTML = '';

            if (facts.length === 0) {
                factsContainer.innerHTML = '<p>No facts found.</p>';
                return;
            }

            const ul = document.createElement('ul');
            facts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact.text;
                ul.appendChild(li);
            });
            factsContainer.appendChild(ul);
        } catch (error) {
            console.error('Failed to load facts:', error);
            factsContainer.innerHTML = '<p>Error loading facts. Check the console for details.</p>';
        }
    }

    loadFacts();
});