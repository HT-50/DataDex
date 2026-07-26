// Pokédex search, suggestions, and card list.
const baseUrl = "https://pokeapi.co/api/v2/pokemon/";
const pageSize = 20;
const moreIncrement = 10;

let pokemonNames = [];
let matchedNames = [];
let visibleMatches = 5;
let currentOffset = 0;
let input, cards, suggestBox, showMoreButton;

window.addEventListener("DOMContentLoaded", () => {
    input = document.getElementById("searchInput");
    cards = document.getElementById("pokemonContainer");
    suggestBox = document.getElementById("searchSuggestions");

    document.getElementById("searchButton").addEventListener("click", searchPokemon);
    input.addEventListener("input", showSuggestions);
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") searchPokemon();
    });
    // Close suggestions when the user clicks somewhere else.
    document.addEventListener("click", event => {
      if (!event.target.closest("#searchInput, #searchSuggestions")) {
        suggestBox.innerHTML = "";
      }
    });

    createShowMoreButton();
    loadPokemonNames();
    loadDefaultPokemon();
});

function createShowMoreButton() {
    showMoreButton = document.createElement("button");
    showMoreButton.id = "showMoreButton";
    showMoreButton.type = "button";
    showMoreButton.style.display = "none";
    showMoreButton.addEventListener("click", loadMoreResults);
    cards.after(showMoreButton);
}

async function loadPokemonNames() {
    try {
        const response = await fetch(`${baseUrl}?limit=1154`);
        const data = await response.json();
        pokemonNames = data.results.map(pokemon => pokemon.name);
    } catch {
        // Search still works for exact Pokémon names if this request fails.
        pokemonNames = [];
    }
}

function showSuggestions() {
    const query = input.value.trim().toLowerCase();
    if (!query || !pokemonNames.length) {
        suggestBox.innerHTML = "";
        return;
    }

    const suggestions = pokemonNames.filter(name => name.includes(query)).slice(0, 5);
    suggestBox.innerHTML = suggestions.length
        ? suggestions.map(name =>
            `<div class="search-suggestion-item" data-value="${name}">${prettyName(name)}</div>`
        ).join("")
        : '<div class="search-suggestion-empty">No suggestions</div>';

    suggestBox.querySelectorAll(".search-suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
            input.value = item.dataset.value;
            suggestBox.innerHTML = "";
            searchPokemon();
        });
    });
}

async function searchPokemon() {
    const query = input.value.trim().toLowerCase();
    suggestBox.innerHTML = "";

    if (!query) {
        loadDefaultPokemon();
        return;
    }

    showMessage(`Searching ${query}...`);
    showMoreButton.style.display = "none";

    try {
        const response = await fetch(baseUrl + encodeURIComponent(query));
        if (!response.ok) throw new Error("Pokémon not found");
        cards.innerHTML = renderCard(await response.json());
    } catch {
        // A partial name, such as "char", shows matching Pokémon.
        matchedNames = pokemonNames.filter(name => name.includes(query));
        visibleMatches = 5;

        if (!matchedNames.length) {
            showMessage(`No Pokémon found for "${query}".`);
            return;
        }

        showMatchedPokemon();
    }
}

async function showMatchedPokemon() {
    const names = matchedNames.slice(0, visibleMatches);
    const pokemon = await Promise.all(names.map(getPokemon));
    const cardsHtml = pokemon.filter(Boolean).map(renderCard).join("");

    if (!cardsHtml) {
        showMessage("No similar Pokémon could be loaded.");
        return;
    }

    cards.innerHTML = cardsHtml;
    showMoreButton.style.display = visibleMatches < matchedNames.length ? "inline-block" : "none";
    showMoreButton.textContent = "⬇️ Show more";
}

async function loadDefaultPokemon(loadMore = false) {
    try {
        if (!loadMore) currentOffset = 0;

        const response = await fetch(`${baseUrl}?offset=${currentOffset}&limit=${pageSize}`);
        const data = await response.json();
        const pokemon = await Promise.all(data.results.map(result => getPokemon(result.url)));
        const cardsHtml = pokemon.filter(Boolean).map(renderCard).join("");

        cards.innerHTML = loadMore ? cards.innerHTML + cardsHtml : cardsHtml;
        currentOffset += pageSize;
        showMoreButton.textContent = "⬇️ Show more Pokémon";
        showMoreButton.style.display = "inline-block";
    } catch {
        showMessage("Couldn't load Pokémon.");
    }
}

function loadMoreResults() {
    if (!input.value.trim()) {
        loadDefaultPokemon(true);
        return;
    }

    visibleMatches = Math.min(visibleMatches + moreIncrement, matchedNames.length);
    showMatchedPokemon();
}

async function getPokemon(nameOrUrl) {
    try {
        const response = await fetch(nameOrUrl.startsWith("http") ? nameOrUrl : baseUrl + nameOrUrl);
        return response.ok ? response.json() : null;
    } catch {
        return null;
    }
}

function renderCard(data) {
    return `
        <div class="pokemon-card" onclick="window.location.href='Detail.html?id=${data.id}'">
            <div class="card-img-wrapper">
                <img src="${data.sprites.other["official-artwork"].front_default || data.sprites.front_default}" alt="${data.name}">
            </div>
            <div class="card-body">
                <h3 class="pokemon-name">${prettyName(data.name)}</h3>
                <p class="pokemon-id">#${data.id}</p>
                <div class="type-list">
                    ${data.types.map(type => `<span class="pokemon-type type-${type.type.name}">${prettyName(type.type.name)}</span>`).join("")}
                </div>
                <p class="pokemon-meta">Height: ${data.height / 10} m • Weight: ${data.weight / 10} kg</p>
            </div>
        </div>`;
}

function showMessage(message) {
    cards.innerHTML = `<div class="message-box">${message}</div>`;
    showMoreButton.style.display = "none";
}

function prettyName(name) {
    return name.replace(/(^|[\s-])[a-z]/g, letter => letter.toUpperCase());
}
