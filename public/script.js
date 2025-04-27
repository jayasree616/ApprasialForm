document.addEventListener("DOMContentLoaded", function () {
  const signUpButton = document.getElementById("signUpButton");
  const signInButton = document.getElementById("signInButton");
  const signInForm = document.getElementById("signIn");
  const signUpForm = document.getElementById("signup");
  const adminsign = document.getElementById("adminButton");
  const adminform = document.getElementById("admin_login");

  // Ensure elements are not null
  if (signUpButton) {
    signUpButton.addEventListener("click", function () {
      signInForm.style.display = "none";
      signUpForm.style.display = "block";
    });
  }

  if (signInButton) {
    signInButton.addEventListener("click", function () {
      signInForm.style.display = "block";
      signUpForm.style.display = "none";
    });
  }

  if (adminsign) {
    adminsign.addEventListener("click", function () {
      adminform.style.display =
        adminform.style.display === "none" || adminform.style.display === ""
          ? "block"
          : "none";
    });
  }

  const signUpFormElement = document.querySelector("#signup form");
  const signInFormElement = document.querySelector("#signIn form");
  const admin_element = document.querySelector("#admin_login");

  if (admin_element) {
    admin_element.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(admin_element);
      const data = {
        email: formData.get("email"),
        pass: formData.get("password"),
      };
      const response = await fetch("/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Login successful! Welcome, " + result.user.name);
        window.location.href = "details.html";
      } else {
        alert("Login error: " + result.message);
      }
    });
  }

  // Handle registration form submission
  if (signUpFormElement) {
    signUpFormElement.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(signUpFormElement);
      const data = {
        fName: formData.get("fName"),
        lName: formData.get("lName"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Registration successful!");
        signUpFormElement.reset();
      } else {
        alert("Registration error: " + result.error);
      }
    });
  }

  // Handle login form submission
  if (signInFormElement) {
    signInFormElement.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(signInFormElement);
      const data = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Login successful! Welcome, " + result.user.first_name);
        window.location.href = "sih.html";
      } else {
        alert("Login error: " + result.message);
      }
    });
  }
});
