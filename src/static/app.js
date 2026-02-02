document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Clear dropdown before repopulating
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants:</h5>
            <ul class="participants-list">
              ${
                details.participants.length === 0
                  ? '<li><em>No participants yet</em></li>'
                  : details.participants.map(email => `
                      <li>
                        <span class="participant-email">${email}</span>
                        <span class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${email}">&#128465;</span>
                      </li>
                    `).join('')
              }
            </ul>
          </div>
        `;

        // Add event listeners for delete icons
        const deleteIcons = activityCard.querySelectorAll('.delete-participant');
        deleteIcons.forEach(icon => {
          icon.addEventListener('click', async (e) => {
            const activity = icon.getAttribute('data-activity');
            const email = icon.getAttribute('data-email');
            const signupMessageDiv = document.getElementById('signup-message');
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
                method: 'POST',
              });
              const result = await response.json();
              if (response.ok) {
                fetchActivities();
                signupMessageDiv.textContent = result.message || 'Participant removed.';
                signupMessageDiv.className = 'success';
              } else {
                signupMessageDiv.textContent = result.detail || 'Failed to remove participant.';
                signupMessageDiv.className = 'error';
              }
              signupMessageDiv.classList.remove('hidden');
              setTimeout(() => {
                signupMessageDiv.classList.add('hidden');
              }, 5000);
            } catch (error) {
              signupMessageDiv.textContent = 'Error removing participant.';
              signupMessageDiv.className = 'error';
              signupMessageDiv.classList.remove('hidden');
            }
          });
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      const signupMessageDiv = document.getElementById('signup-message');
      if (response.ok) {
        fetchActivities();
        signupMessageDiv.textContent = result.message;
        signupMessageDiv.className = "success";
        signupForm.reset();
      } else {
        signupMessageDiv.textContent = result.detail || "An error occurred";
        signupMessageDiv.className = "error";
      }

      signupMessageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        signupMessageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
