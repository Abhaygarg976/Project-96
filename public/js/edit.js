const form = document.querySelector("#userForm");
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nameInput = document.querySelector("input[name='user_name']");
    const emailInput = document.querySelector("input[name='email']");
    const mobileInput = document.querySelector("input[name='mobile']");
    const profileImageInput = document.querySelector("input[name='Imagepath']");

    if (!nameInput.value || !emailInput.value || !mobileInput.value) {
        Swal.fire({
            title: "Error!",
            text: "Please fill in all the required fields.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update the user?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Update",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
            form.submit();
        }
    });
});