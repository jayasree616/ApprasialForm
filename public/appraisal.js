document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#appraisalForm form");
  const submitButton = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    submitButton.disabled = true; // Disable the button immediately

    const formData = new FormData(form);
    const data = {
      facultyName: formData.get("facultyName"),
      employeeCode: formData.get("employeeCode"),
      publication: formData.get("publication"),
      events: formData.get("events"),
      projects: formData.get("projects"),
      lectures: formData.get("lectures"),
    };

    try {
      const response = await fetch("/submit-appraisal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Server response:", result); // Log the server response

      if (response.ok) {
        alert(result.message);
        form.reset();
        // window.location.href = "details.html"; // Redirect to details page
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while submitting the form.");
    } finally {
      submitButton.disabled = false; // Re-enable the submit button
      console.log("Form submission complete.");
    }
  });
});
