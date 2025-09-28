document.addEventListener("DOMContentLoaded", () => {
    // Navigation functions
    function showLogin() {
        document.getElementById('cover-page')?.classList.add('hidden');
        document.getElementById('signup-page')?.classList.add('hidden');
        document.getElementById('login-page')?.classList.remove('hidden');
    }

    function showSignup() {
        document.getElementById('cover-page')?.classList.add('hidden');
        document.getElementById('login-page')?.classList.add('hidden');
        document.getElementById('signup-page')?.classList.remove('hidden');
    }

    function showCover() {
        document.getElementById('login-page')?.classList.add('hidden');
        document.getElementById('signup-page')?.classList.add('hidden');
        document.getElementById('cover-page')?.classList.remove('hidden');
    }

    // Handle Login
    document.getElementById('login-form')?.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.href = "upload.html"; // Redirect to upload page
            } else {
                alert("Login failed: " + data.error);
            }
        } catch (error) {
            alert("Network error: " + error.message);
        }
    });

    // Handle Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }

    // Handle Signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const dob = document.getElementById('signup-dob').value;
            const gender = document.getElementById('signup-gender').value;

            const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com)$/;
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            let errorMessage = "";

            if (!name) errorMessage += "Full Name is required.\n";
            if (!email || !emailRegex.test(email)) errorMessage += "Invalid email.\n";
            if (!password || !passwordRegex.test(password)) {
                errorMessage += "Password must be at least 8 characters long, contain a letter, a number, and a special character.\n";
            }
            if (!dob) errorMessage += "Date of Birth is required.\n";
            if (!gender) errorMessage += "Gender is required.\n";

            if (errorMessage) {
                alert(errorMessage);
                return;
            }

            const signupData = { name, email, password, dob, gender };

            try {
                const response = await fetch('http://127.0.0.1:5000/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signupData)
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    window.location.href = "upload.html";
                } else {
                    alert("Signup failed: " + data.error);
                }
            } catch (error) {
                alert("Network error: " + error.message);
            }
        });
    }

    // Accordion logic (if present)
    document.querySelectorAll('.accordion-btn').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;

            document.querySelectorAll('.accordion-content').forEach(c => {
                if (c !== content) {
                    c.style.maxHeight = null;
                }
            });

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // === Upload Logic (without Grad-CAM) ===
    const uploadForm = document.getElementById("uploadForm");
    const resultText = document.getElementById("resultText");

    if (uploadForm) {
        uploadForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const fileInput = document.getElementById("xrayImage");
            const file = fileInput.files[0];

            if (!file) {
                resultText.textContent = "Please select an image first.";
                return;
            }

            resultText.innerHTML = '<div class="loader"></div><p style="margin-top: 10px;">Analyzing X-ray...</p>';

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch("http://127.0.0.1:5000/predict", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    resultText.innerHTML = `
                        <strong>Diagnosis:</strong> ${data.result}<br>
                        <strong>Confidence:</strong> ${(data.confidence * 100).toFixed(2)}%
                    `;
                } else {
                    resultText.innerHTML = `<span style="color:red;">Error: ${data.error || "Something went wrong."}</span>`;
                }
            } catch (error) {
                resultText.innerHTML = `<span style="color:red;">Network error: ${error.message}</span>`;
            }
        });
    }
});

