document.getElementById("submit-btn").addEventListener("click", function (event) {
    event.preventDefault();

    var nameInput = document.getElementById("user_name");
    var emailInput = document.getElementById("email");
    var mobileInput = document.getElementById("mobile");
    var passwordInput = document.getElementById("password");
    var profileImageInput = document.getElementById("Imagepath");

    if (nameInput.value === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a name',
        });
        return;
    }

    if (emailInput.value === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter an email',
        });
        return;
    }

    if (mobileInput.value === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a mobile number',
        });
        return;
    }
    if (passwordInput.value === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a Password',
        });
        return;
    }

    if (!profileImageInput.files || profileImageInput.files.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please choose an image',
        });
        return;
    }

    var formData = new FormData();
    formData.append("user_name", nameInput.value);
    formData.append("email", emailInput.value);
    formData.append("mobile", mobileInput.value);
    formData.append("password", passwordInput.value);
    formData.append("Imagepath", profileImageInput.files[0]);

    fetch("/add_user", {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'User added successfully',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/dashboard";
                    }
                });
            } else {
                throw new Error("Failed to add user");
            }
        })
        .catch((error) => {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to add user',
            });
        });
});