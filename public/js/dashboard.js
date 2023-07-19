// const body = document.querySelector("body"), modeToggle =
//     body.querySelector(".mode-toggle"); sidebar = body.querySelector("nav");
// sidebarToggle = body.querySelector(".sidebar-toggle"); let getMode =
//     localStorage.getItem("mode"); if (getMode && getMode === "dark") {
//         body.classList.toggle("dark");
//     } let getStatus =
//         localStorage.getItem("status"); if (getStatus && getStatus === "close") {
//             sidebar.classList.toggle("close");
//         } modeToggle.addEventListener("click",
//             () => {
//                 body.classList.toggle("dark"); if
//                     (body.classList.contains("dark")) {
//                     localStorage.setItem("mode", "dark");
//                 } else { localStorage.setItem("mode", "light"); }
//             });
// sidebarToggle.addEventListener("click", () => {
//     sidebar.classList.toggle("close"); if
//         (sidebar.classList.contains("close")) {
//         localStorage.setItem("status",
//             "close");
//     } else { localStorage.setItem("status", "open"); }
// });

// const searchInput = document.getElementById('searchInput');
// searchInput.addEventListener('input', function () {
//     const searchTerm = searchInput.value.trim().toLowerCase();
//     const rows = document.querySelectorAll('#userDataTable tbody tr');
//     rows.forEach(row => {
//         const nameCell = row.querySelector('td:nth-child(2)');
//         const emailCell = row.querySelector('td:nth-child(3)');
//         const mobileCell = row.querySelector('td:nth-child(4)');

//         const name = nameCell.textContent.trim().toLowerCase();
//         const email = emailCell.textContent.trim().toLowerCase();
//         const mobile = mobileCell.textContent.trim().toLowerCase();

//         if (
//             name.includes(searchTerm) ||
//             email.includes(searchTerm) ||
//             mobile.includes(searchTerm)
//         ) {
//             row.style.display = '';
//         } else {
//             row.style.display = 'none';
//         }
//     });
// });


let recognition;

    function initRecognition() {
      if (!("webkitSpeechRecognition" in window)) {
        console.error("Speech recognition is not supported in this browser.");
        return;
      }

      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onresult = function (event) {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(speechResult);
      };

      recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
      };
    }

    function startRecognition() {
      if (recognition) {
        recognition.start();
      } else {
        console.error("Speech recognition is not initialized.");
      }
    }

    function handleVoiceCommand(command) {
        let feedbackText = "";
      
        switch (command) {
          case "login":
            feedbackText = "Redirecting to the login page.";
            window.location.href = "/";
            break;
          case "browser":
            feedbackText = "Redirecting to the attendance browser page.";
            window.location.href = "/attendanceBrowser";
            break;
          case "mobile":
            feedbackText = "Redirecting to the attendance mobile page.";
            window.location.href = "/attendanceMobile";
            break;
          case "register":
            feedbackText = "Redirecting to the register page.";
            window.location.href = "/auth_reg";
            break;
          case "dashboard":
            feedbackText = "Redirecting to the dashboard page.";
            window.location.href = "/dashboard";
            break;
          case "report":
            feedbackText = "Redirecting to the report page.";
            window.location.href = "/report";
            break;
          default:
            feedbackText = "Sorry, I didn't understand that command.";
            break;
        }
      
        speak(feedbackText);
      }
      

    function speak(text) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }

    document.addEventListener("DOMContentLoaded", function () {
      initRecognition();
    });



    const tableBody = document.getElementById('userDataTable');
    const rows = tableBody.getElementsByTagName('tr');
    const totalRows = rows.length;
    const itemsPerPage = 10;
    let currentPage = 0;

    function showRows(pageNumber) {
      for (let i = 0; i < totalRows; i++) {
        if (i >= pageNumber * itemsPerPage && i < (pageNumber + 1) * itemsPerPage) {
          rows[i].style.display = 'table-row';
        } else {
          rows[i].style.display = 'none';
        }
      }
    }

    function showPage(pageNumber) {
      currentPage = pageNumber;
      showRows(currentPage);
    }

    function goToNextPage() {
      if (currentPage < Math.ceil(totalRows / itemsPerPage) - 1) {
        showPage(currentPage + 1);
      }
    }

    function goToPreviousPage() {
      if (currentPage > 0) {
        showPage(currentPage - 1);
      }
    }

    showPage(currentPage);

    document.getElementById('nextBtn').addEventListener('click', goToNextPage);
    document.getElementById('prevBtn').addEventListener('click', goToPreviousPage);