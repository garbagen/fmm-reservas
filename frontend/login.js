// frontend/login.js

async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Store the token
            localStorage.setItem('adminToken', data.token);
            // Redirect to admin panel
            window.location.href = 'admin-dashboard.html';
        } else {
            document.getElementById('error-message').style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('error-message').style.display = 'block';
    }
}