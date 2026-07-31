// Api and varible to store fav pokemon to local storage
const baseUrl="https://pokeapi.co/api/v2/pokemon/";
let favouritePokemon=[];
let filteredPokemon=[];
let suggestBox;
let input;
let cards;

window.addEventListener("DOMContentLoaded",()=>{
    input=document.getElementById("searchInput");
    cards=document.getElementById("pokemonContainer");
    document.getElementById("searchButton")
    .addEventListener("click",searchFavouritePokemon);
    input.addEventListener("keydown",event=>{
        if(event.key==="Enter"){
            searchFavouritePokemon();
        }
    });
    input.addEventListener("input",()=>{
        if(input.value.trim()===""){
            filteredPokemon=[...favouritePokemon];
            renderFavouritePokemon();
        }
    });
    loadFavouritePokemon();
    suggestBox=document.getElementById("searchSuggestions");
    input.addEventListener("input",showSuggestions);
    document.addEventListener("click",event=>{
        if(!event.target.closest("#searchInput,#searchSuggestions")){
            suggestBox.innerHTML="";
        }
    });
});

async function loadFavouritePokemon(){
    const favourites=getUserFavourites();
    if(favourites.length===0){
        showMessage("No favourite Pokémon yet.");
        favouritePokemon=[];
        filteredPokemon=[];
        return;
    }

    try{
        const pokemon=await Promise.all(
            favourites.map(id=>getPokemon(String(id)))
        );
        favouritePokemon=pokemon.filter(Boolean);
        filteredPokemon=[...favouritePokemon];
        renderFavouritePokemon();
    }catch{
        showMessage("Failed to load favourites.");
    }
}

async function getPokemon(nameOrUrl){
    try{
        const response=await fetch(
            nameOrUrl.startsWith("http")
            ?nameOrUrl
            :baseUrl+nameOrUrl
        );
        return response.ok
            ?response.json()
            :null;
    }catch{
        return null;
    }
}

function renderFavouritePokemon(){
    if(filteredPokemon.length===0){
        showMessage("No Pokémon found.");
        return;
    }
    cards.innerHTML=filteredPokemon
    .map(renderCard)
    .join("");
}

function searchFavouritePokemon(){
    const query=input.value.trim().toLowerCase();
    if(!query){
        filteredPokemon=[...favouritePokemon];
        renderFavouritePokemon();
        return;
    }
    filteredPokemon=favouritePokemon.filter(data=>
        data.name.includes(query)||
        String(data.id).includes(query)
    );
    renderFavouritePokemon();
}

function renderCard(data){
    return`
        <div class="pokemon-card" onclick="window.location.href='Detail.html?id=${data.id}'">
            <div class="card-img-wrapper">
                <img src="${data.sprites.other["official-artwork"].front_default||data.sprites.front_default}" alt="${data.name}">
            </div>
            <div class="card-body">
                <h3 class="pokemon-name">${prettyName(data.name)}</h3>
                <p class="pokemon-id">#${data.id}</p>
                <div class="type-list">
                    ${data.types.map(type=>`<span class="pokemon-type type-${type.type.name}">${prettyName(type.type.name)}</span>`).join("")}
                </div>
                <p class="pokemon-meta">
                    Height: ${data.height/10} m • Weight: ${data.weight/10} kg
                </p>
            </div>
        </div>`;
}

function showMessage(message){
    cards.innerHTML=`
        <div class="message-box">
            ${message}
        </div>
    `;
}

function prettyName(name){
    return name.replace(/(^|[\s-])[a-z]/g,letter=>letter.toUpperCase());
}

function refreshFavouritePage(){
    loadFavouritePokemon();
}

function showSuggestions(){
    const query=input.value.trim().toLowerCase();
    if(!query){
        suggestBox.innerHTML="";
        return;
    }
    const suggestions=favouritePokemon
        .filter(p=>p.name.includes(query))
        .slice(0,5);
    suggestBox.innerHTML=suggestions.length
        ?suggestions.map(p=>
            `<div class="search-suggestion-item" data-value="${p.name}">
                ${prettyName(p.name)}
            </div>`
        ).join("")
        :'<div class="search-suggestion-empty">No suggestions</div>';
    suggestBox.querySelectorAll(".search-suggestion-item").forEach(item=>{
        item.onclick=()=>{
            input.value=item.dataset.value;
            suggestBox.innerHTML="";
            searchFavouritePokemon();
        };
    });
}