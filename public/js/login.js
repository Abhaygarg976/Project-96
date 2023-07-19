document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.sign-in-form');
  
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.login_status === 1) {
            Toastify({
              text: 'Login Successful. Welcome to the dashboard!',
              backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
              className: 'info',
              duration: 2000,
              gravity: 'top',
              close: true
            }).showToast();
  
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          } else {
            Toastify({
              text: 'Login Failed. Invalid email or password. Please try again.',
              backgroundColor: '#f44336',
              className: 'error',
              duration: 2000,
              gravity: 'top', 
              close: true
            }).showToast();
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  });
  