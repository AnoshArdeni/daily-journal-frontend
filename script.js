document.addEventListener("DOMContentLoaded", () => {
  fetchEntries();

  const form = document.getElementById("entry-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addEntry();
  });

  // Close popup
  document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("quote-popup").classList.add("hidden");
  });

  // Show quote popup on button click
  document.getElementById("show-quote-btn").addEventListener("click", () => {
    fetchQuote();
  });

  // Show all entries when "Show All" button is clicked
  document.getElementById("clear-filter").addEventListener("click", () => {
    document.getElementById("filter-date").value = "";
    fetchEntries();
  });
});




// Filter entries by date
document.getElementById("filter-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent page reload

  const selectedDate = document.getElementById("filter-date").value;
  if (!selectedDate) {
    alert("Please select a date.");
    return;
  }
  // Fetch entries for the selected date
  fetch(`http://127.0.0.1:5000/api/journal/${selectedDate}`)
    .then(res => {
      if (!res.ok) throw new Error("No entry found for that date.");

      return res.json();
    })
    .then(entry => {
      console.log(entry); // See the structure
      const entriesSection = document.getElementById("entries-container");
      if (!entry || (Array.isArray(entry) && entry.length === 0)) {
        entriesSection.innerHTML = `<p style="color:red;">No entry found for that date.</p>`;
        return;
      }
      const entriesArray = Array.isArray(entry) ? entry : [entry];
      entriesSection.innerHTML = entriesArray.map(e => `
        <div class="entry">
          <h3>Entry for ${e.date}</h3>
          <p><strong>Mood:</strong> ${e.mood || "N/A"}</p>
          <p>${e.entry}</p>
          <hr/>
        </div>
      `).join('');
    })
    .catch(err => {
      const entriesSection = document.getElementById("entries");
      entriesSection.innerHTML = `<p style="color:red;">${err.message}</p>`;
    });
});


  // Function to fetch a random quote from the API
  function fetchQuote() {
    fetch("http://127.0.0.1:5000/api/quote")
    .then(res => res.json())
    .then(data => {
      const quote = data.quote;
      document.getElementById("quote-text").textContent = quote;
      document.getElementById("quote-popup").classList.remove("hidden");
    })
    .catch(err => {
      console.error("Failed to load quote:", err);
    });
  }



// Function to fetch all journal entries
// This will be called on page load and after adding/deleting entries
function fetchEntries() {
  fetch("http://127.0.0.1:5000/api/journal")
    .then(res => res.json())
    .then(entries => {
      const container = document.getElementById("entries-container");
      container.innerHTML = "";

      entries.forEach(entry => {
        const card = document.createElement("div");
        card.className = "entry-card";
        card.dataset.id = entry.id;
        
        card.innerHTML = `
          <h3>${entry.date}</h3>
          <p><strong>Mood:</strong> ${entry.mood || "N/A"}</p>
          <p>${entry.entry}</p>
          <button class="delete-btn hidden">Delete</button>
        `;

        // Click to toggle delete button visibility
        card.addEventListener("click", () => {
          const btn = card.querySelector(".delete-btn");
          btn.classList.toggle("hidden");
        });

        // Handle delete
        card.querySelector(".delete-btn").addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent card click
          deleteEntry(entry.id);
        });

        container.appendChild(card);
      });
    });
}


// Function to delete an entry by ID
function deleteEntry(id) {
  fetch(`http://127.0.0.1:5000/api/journal/${id}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete entry");
      return res.json();
    })
    .then(() => {
      fetchEntries(); // Refresh entries list
    })
    .catch(err => {
      console.error(err);
      alert("Error deleting entry.");
    });
}



function addEntry() {
  const date = document.getElementById("date").value;
  const mood = document.getElementById("mood").value;
  const entry = document.getElementById("entry").value;

  if (!date || !entry) {
    alert("Please fill in all fields.");
    return;
  }

  fetch("http://127.0.0.1:5000/api/journal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ date, mood, entry })
  }) 
    .then(res => res.json())
    .then(data => {
      console.log("Entry added:", data);
      fetchEntries(); // Refresh the entries list
      document.getElementById("date").value = "";
      document.getElementById("mood").value = "";
      document.getElementById("entry").value = "";
    })
    .catch(err => {
      console.error("Error adding entry:", err);
    });



}

