document.addEventListener('DOMContentLoaded', async () => {
    const authStatusDiv = document.getElementById('auth-status');

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
});