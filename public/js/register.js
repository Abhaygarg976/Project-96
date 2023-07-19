function handleRegistration() {
    var lastName = document.getElementById('user_name').value;
    var email = document.getElementById('email').value;
    var mobile = document.getElementById('mobile').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('cpassword').value;


    if ( !lastName || !email || !mobile || !password || !confirmPassword) {
        Swal.fire({
            title: 'Error!',
            text: 'Please fill in all fields.',
            icon: 'error',
            showConfirmButton: false,
            timer: 5000
        });
        return false;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match.');
        return false;
    }

    var passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]).{8,32}$/;
    if (!passwordRegex.test(password)) {
        showAlert('Password should contain at least one letter, one number, and one special character.');
        return false;
    }

    if (mobile.length !== 10 || isNaN(mobile)) {
        showAlert('Mobile number should have exactly 10 digits.');
        return false;
    }

    showSuccessAlert('Registration successful. Welcome, ' + lastName + '!');

    return false;
}

function showAlert(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
    });
}

function showSuccessAlert(message) {
    Swal.fire({
        title: 'Success',
        text: message,
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
    }).then(() => {
        document.getElementById('companyForm').submit();
    });
}