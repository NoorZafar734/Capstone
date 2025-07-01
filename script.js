// Navigation functions
function showLogin() {
    document.getElementById('cover-page').classList.add('hidden');
    document.getElementById('signup-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
}

function showSignup() {
    document.getElementById('cover-page').classList.add('hidden');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('signup-page').classList.remove('hidden');
}

function showCover() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('signup-page').classList.add('hidden');
    document.getElementById('cover-page').classList.remove('hidden');
}

// Handle Login
document.getElementById('login-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com)$/;

    if (emailRegex.test(email) && password.length >= 8) {
        alert("Login successful!");
        window.location.href = "upload.html"; // Redirect to upload page
    } else {
        alert("Invalid email or password.");
    }
});

// Handle Signup
document.getElementById('signup-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const dob = document.getElementById('signup-dob').value;
    const gender = document.getElementById('signup-gender').value;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com)$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    let errorMessage = "";

    if (!name) {
        errorMessage += "Full Name is required.\n";
    }
    if (!email || !emailRegex.test(email)) {
        errorMessage += "Invalid email.\n";
    }
    if (!password || !passwordRegex.test(password)) {
        errorMessage += "Password must be at least 8 characters long, contain a letter, a number, and a special character.\n";
    }
    if (!dob) {
        errorMessage += "Date of Birth is required.\n";
    }
    if (!gender) {
        errorMessage += "Gender is required.\n";
    }

    if (errorMessage) {
        alert(errorMessage);
    } else {
        alert("Signup successful!");
        window.location.href = "upload.html";
    }
});
document.querySelectorAll('.accordion-btn').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      
      // Close other accordions
      document.querySelectorAll('.accordion-content').forEach(c => {
        if (c !== content) {
          c.style.maxHeight = null;
        }
      });
  
      // Toggle current accordion
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
  

// Upload Page Logic
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("uploadForm");
    const resultText = document.getElementById("resultText");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
          
            const fileInput = document.getElementById("xrayImage");
            const file = fileInput.files[0];
          
            if (!file) {
              resultText.textContent = "Please select an image first.";
              return;
            }
          
            // Show loading spinner
            resultText.innerHTML = '<div class="loader"></div><p style="margin-top: 10px;">Analyzing X-ray...</p>';
          
            // Simulated AI analysis result
            setTimeout(() => {
              resultText.innerHTML = `
                <strong>Diagnosis:</strong> Pneumonia 
                
              `;
            }, 2000);
          });
          
          
    }
});

