// Store the IDs for the two columns
const COLUMN_1_ID = 1;
const COLUMN_2_ID = 2;

// Get elements for the first column
const pokemonColumn1 = document.getElementById("pokemon-column-1");
const pokemonSprite1 = pokemonColumn1.querySelector(".pokemon-sprite");
const pokemonStats1 = pokemonColumn1.querySelector(".pokemon-stats").children;
const abilityDescription1 = pokemonColumn1.querySelector(".pokemon-abilities");

// Get elements for the second column
const pokemonColumn2 = document.getElementById("pokemon-column-2");
const pokemonSprite2 = pokemonColumn2.querySelector(".pokemon-sprite");
const pokemonStats2 = pokemonColumn2.querySelector(".pokemon-stats").children;
const abilityDescription2 = pokemonColumn2.querySelector(".pokemon-abilities");

// Color codes for different Pokémon types
const typeColors = {
  normal: "rgba(168, 167, 122, 0.7)",
  fire: "rgba(238, 129, 48, 0.7)",
  water: "rgba(99, 144, 240, 0.7)",
  electric: "rgba(247, 208, 44, 0.7)",
  grass: "rgba(122, 199, 76, 0.7)",
  ice: "rgba(150, 217, 214, 0.7)",
  fighting: "rgba(194, 46, 40, 0.7)",
  poison: "rgba(163, 62, 161, 0.7)",
  ground: "rgba(226, 191, 101, 0.7)",
  flying: "rgba(169, 143, 243, 0.7)",
  psychic: "rgba(249, 85, 135, 0.7)",
  bug: "rgba(166, 185, 26, 0.7)",
  rock: "rgba(182, 161, 54, 0.7)",
  ghost: "rgba(115, 87, 151, 0.7)",
  dragon: "rgba(111, 53, 252, 0.7)",
  dark: "rgba(112, 87, 70, 0.7)",
  steel: "rgba(183, 183, 206, 0.7)",
  fairy: "rgba(214, 133, 173, 0.7)",
};

// Substitute sprite URL for Pokémon without official sprites
const SUBSTITUTE_SPRITE_URL = "./images/substitute.png";

// Function to fetch ability details
async function fetchAbilityDetails(abilityName) {
  const apiUrl = `https://pokeapi.co/api/v2/ability/${abilityName}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

// Function to fetch Pokémon data and update the page
function fetchPokemonData(searchTerm, columnId) {
  let apiUrl;

  if (!searchTerm) {
    alert("Please enter a Pokémon name or number.");
    return;
  }

  if (!isNaN(searchTerm)) {
    const pokemonNumber = parseInt(searchTerm);
    apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`;
  } else {
    const pokemonName = searchTerm.toLowerCase();
    apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
  }

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Pokémon not found.");
      }
      return response.json();
    })
    .then(async (data) => {
      const name = data.name;
      const stats = data.stats;
      const abilities = data.abilities;
      const types = data.types;
      const spriteUrl = data.sprites.front_default || SUBSTITUTE_SPRITE_URL;
      const pokemonNumber = data.id;

      const pokemonInfoContainer = document.getElementById(
        `pokemon-column-${columnId}`
      );
      const pokemonSprite =
        pokemonInfoContainer.querySelector(".pokemon-sprite");
      const pokemonStats = pokemonInfoContainer.querySelector(".pokemon-stats");
      const pokemonAbilities =
        pokemonInfoContainer.querySelector(".pokemon-abilities");
      const pokemonTypes = pokemonInfoContainer.querySelector(".pokemon-types");

      // Update the Pokémon name, sprite, stats, abilities, and types
      pokemonInfoContainer.querySelector("h2").textContent =
        name.charAt(0).toUpperCase() + name.slice(1) + " #" + pokemonNumber;
      pokemonSprite.src = spriteUrl;

      // Display the Pokémon stats
      pokemonStats.innerHTML = stats
        .map(
          (stat) => `<li>${stat.stat.name}: <span>${stat.base_stat}</span></li>`
        )
        .join("");

      // Fetch ability details and display descriptions for abilities with descriptions
      pokemonAbilities.innerHTML = "";
      for (const abilitySlot of abilities) {
        const abilityName = abilitySlot.ability.name;
        const isHidden = abilitySlot.is_hidden;

        const abilityElement = document.createElement("li");

        const abilityNameElement = document.createElement("strong");
        abilityNameElement.textContent = abilityName;
        abilityElement.appendChild(abilityNameElement);

        if (isHidden) {
          const hiddenAbilityName = document.createElement("span");
          hiddenAbilityName.textContent = " (Hidden)";
          abilityElement.appendChild(hiddenAbilityName);
        }

        const abilityDetails = await fetchAbilityDetails(abilityName);
        const description = abilityDetails.effect_entries.find(
          (entry) => entry.language.name === "en"
        )?.short_effect;

        if (description) {
          const descriptionElement = document.createElement("p");
          descriptionElement.textContent = description;
          abilityElement.appendChild(descriptionElement);
        }

        pokemonAbilities.appendChild(abilityElement);
      }

      // Display a message when there are no abilities
      if (abilities.length === 0) {
        const abilityElement = document.createElement("li");
        abilityElement.textContent = "No abilities.";
        pokemonAbilities.appendChild(abilityElement);
      }

      // Call the displayPokemonTypes function to display the types
      displayPokemonTypes(
        types.map((type) => type.type.name),
        columnId
      );

      // Change the background color of the column based on the type
      const typeColor = typeColors[types[0].type.name] || "#FFFFFF";
      pokemonInfoContainer.style.backgroundColor = typeColor;

      // Compare stats and highlight the higher stats in bold green
      compareAndHighlightStats(columnId);
    })
    .catch((error) => {
      console.error("Error fetching Pokémon data:", error.message);
    });
}

// Function to compare stats and highlight the higher stats in bold green
function compareAndHighlightStats(columnId) {
  const myStats = columnId === COLUMN_1_ID ? pokemonStats1 : pokemonStats2;
  const theirStats = columnId === COLUMN_1_ID ? pokemonStats2 : pokemonStats1;

  for (let i = 0; i < myStats.length; i++) {
    const myStatValue = parseInt(myStats[i].querySelector("span").textContent);
    const theirStatValue = parseInt(
      theirStats[i].querySelector("span").textContent
    );

    if (myStatValue > theirStatValue) {
      myStats[i].style.fontWeight = "bold";
      myStats[i].style.color = "orange";
      theirStats[i].style.fontWeight = "normal";
      theirStats[i].style.color = "black";
    } else if (myStatValue < theirStatValue) {
      myStats[i].style.fontWeight = "orange";
      myStats[i].style.color = "black";
      theirStats[i].style.fontWeight = "bold";
      theirStats[i].style.color = "orange";
    } else {
      myStats[i].style.fontWeight = "normal";
      myStats[i].style.color = "black";
      theirStats[i].style.fontWeight = "normal";
      theirStats[i].style.color = "black";
    }
  }
}

// Function to handle Pokémon search
function handlePokemonSearch(columnId) {
  const searchTermInput = searchTermInputs[columnId];
  const suggestionsContainer = suggestionContainers[columnId];

  const searchTerm = searchTermInput.value.trim();
  fetchPokemonData(searchTerm, columnId);
  searchTermInput.value = ""; // Clear the input field

  // Clear the suggestions container
  suggestionsContainer.innerHTML = "";
}

// Event listeners for search buttons
document
  .getElementById("pokemon-search-button-1")
  .addEventListener("click", function () {
    handlePokemonSearch(COLUMN_1_ID);
  });

document
  .getElementById("pokemon-search-button-2")
  .addEventListener("click", function () {
    handlePokemonSearch(COLUMN_2_ID);
  });

// code for auto-suggest

const suggestionContainers = {
  1: document.getElementById("suggestions-1"),
  2: document.getElementById("suggestions-2"),
};

const searchTermInputs = {
  1: document.querySelector("#pokemon-column-1 .pokemon-search-input"),
  2: document.querySelector("#pokemon-column-2 .pokemon-search-input"),
};

searchTermInputs[1].addEventListener("input", async () => {
  await handleAutoSuggest(1);
});

searchTermInputs[2].addEventListener("input", async () => {
  await handleAutoSuggest(2);
});

async function handleAutoSuggest(columnId) {
  const searchTerm = searchTermInputs[columnId].value.trim();

  if (searchTerm.length >= 1) {
    const suggestions = await fetchPokemonSuggestions(searchTerm);
    displaySuggestions(suggestions.slice(0, 5), columnId); // Limit to five suggestions
  } else {
    suggestionContainers[columnId].innerHTML = "";
  }
}

async function fetchPokemonSuggestions(searchTerm) {
  const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  const suggestions = data.results
    .filter((result) => result.name.includes(searchTerm.toLowerCase()))
    .map((result) => result.name);

  return suggestions;
}

function displaySuggestions(suggestions, columnId) {
  const suggestionsContainer = suggestionContainers[columnId];
  suggestionsContainer.innerHTML = "";

  suggestions.forEach((suggestion) => {
    const suggestionElement = document.createElement("div");
    suggestionElement.classList.add("suggestion");
    suggestionElement.textContent = suggestion;

    suggestionElement.addEventListener("click", () => {
      const searchTermInput = searchTermInputs[columnId];
      searchTermInput.value = suggestion;
      handlePokemonSearch(columnId);
    });

    suggestionsContainer.appendChild(suggestionElement);
  });
}

// Function to display Pokémon types
function displayPokemonTypes(types, columnId) {
  const pokemonTypesContainer = document.getElementById(
    `pokemon-types-${columnId}`
  );
  pokemonTypesContainer.innerHTML = types
    .map((type) => `<li>${type}</li>`)
    .join("");
}

// Show the substitute sprite initially
pokemonSprite1.src = SUBSTITUTE_SPRITE_URL;
pokemonSprite2.src = SUBSTITUTE_SPRITE_URL;
pokemonSprite1.style.maxWidth = "200px"; // Set the same size as other sprites
pokemonSprite2.style.maxWidth = "200px";

// Call the displayPokemonTypes function to initialize the types
displayPokemonTypes([], COLUMN_1_ID);
displayPokemonTypes([], COLUMN_2_ID);

//dark mode
document.addEventListener("DOMContentLoaded", function () {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const modeIcon = document.getElementById("mode-icon");
  const body = document.body;

  // Function to update button icon and color
  function updateButton() {
    if (body.classList.contains("dark-mode")) {
      modeIcon.classList.replace("fa-moon", "fa-sun");
      darkModeToggle.style.color = "white";
    } else {
      modeIcon.classList.replace("fa-sun", "fa-moon");
      darkModeToggle.style.color = "black";
    }
  }
  function updateButton() {
    if (body.classList.contains("dark-mode")) {
      modeIcon.classList.replace("fa-moon", "fa-sun");
      darkModeToggle.style.color = "white";
    } else {
      modeIcon.classList.replace("fa-sun", "fa-moon");
      darkModeToggle.style.color = "black";
    }
  }

  // Check if user's preferred mode is already dark
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    body.classList.add("dark-mode");
  }

  // Initial button update
  updateButton();

  darkModeToggle.addEventListener("click", function () {
    body.classList.toggle("dark-mode");
    updateButton();
  });
});
