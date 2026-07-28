// --- API ---
const baseUrl="https://pokeapi.co/api/v2/pokemon/";
// --- Elements ---
const favouriteContainer=document.getElementById("pokemonContainer");
const searchInput=document.getElementById("searchInput");
const searchButton=document.getElementById("searchButton");
// --- Data ---
let favouriteIds=[];
let favouritePokemon=[];
let filteredPokemon=[];

window.addEventListener("load",()=>{
    if(!requireLogin()){
        return;
    }
    loadFavouritePokemon();
});

async function loadFavouritePokemon(){
    favouriteIds=getUserFavourites();
    favouritePokemon=[];
    filteredPokemon=[];
    if(favouriteIds.length===0){
        favouriteContainer.innerHTML=`
        <div class="message-box">
            <h2>No Favourite Pokémon</h2>
            <p>Click the ❤️ button on a Pokémon to add it here.</p>
        </div>
        `;
        return;
    }
    favouriteContainer.innerHTML=`
    <div class="loading-box">
        Loading favourites...
    </div>
    `;
    try{
        const responses=await Promise.all(
            favouriteIds.map(id=>
                fetch(baseUrl+id)
            )
        );
        const data=await Promise.all(
            responses.map(response=>
                response.json()
            )
        );
        favouritePokemon=data;
        filteredPokemon=[...favouritePokemon];
        renderFavouritePokemon();
    }catch(error){
        console.error(error);
        favouriteContainer.innerHTML=`
        <div class="message-box">
            <h2>Failed to load favourites.</h2>
        </div>
        `;
    }
}

function renderFavouritePokemon(){
    if(filteredPokemon.length===0){
        favouriteContainer.innerHTML=`
        <div class="message-box">
            <h2>No Pokémon Found</h2>
            <p>Try another search.</p>
        </div>
        `;
        return;
    }
    let html="";
    filteredPokemon.forEach(data=>{
        html+=renderCard(data);
    });
    favouriteContainer.innerHTML=html;
}

function renderCard(data){
    const types=data.types.map(type=>`
        <span class="type ${type.type.name}">
            ${capitalize(type.type.name)}
        </span>
    `).join("");
    return`
    <div
        class="pokemon-card"
        onclick="openPokemon(${data.id})"
    >
        <img
            src="${data.sprites.other["official-artwork"].front_default}"
            alt="${data.name}"
        >
        <h2>
            ${capitalize(data.name)}
        </h2>
        <p class="pokemon-number">
            #${String(data.id).padStart(4,"0")}
        </p>
        <div class="pokemon-types">
            ${types}
        </div>
    </div>
    `;
}

function openPokemon(id){
    window.location.href=`Pokemon.html?id=${id}`;
}

function capitalize(text){
    return text.charAt(0).toUpperCase()+text.slice(1);
}

if(searchButton){
    searchButton.addEventListener("click",searchFavouritePokemon);
}

if(searchInput){
    searchInput.addEventListener("keydown",event=>{
        if(event.key==="Enter"){
            searchFavouritePokemon();
        }
    });
    searchInput.addEventListener("input",searchFavouritePokemon);
}

function searchFavouritePokemon(){
    const keyword=searchInput.value
        .trim()
        .toLowerCase();
    if(keyword===""){
        filteredPokemon=[...favouritePokemon];
        renderFavouritePokemon();
        return;
    }
    filteredPokemon=favouritePokemon.filter(data=>{
        const name=data.name.toLowerCase();
        const id=String(data.id);
        return(
            name.includes(keyword)||
            id.includes(keyword)
        );
    });
    renderFavouritePokemon();
}

async function refreshFavouritePage(){
    favouriteIds=getUserFavourites();
    if(favouriteIds.length===0){
        favouritePokemon=[];
        filteredPokemon=[];
        favouriteContainer.innerHTML=`
        <div class="message-box">
            <h2>No Favourite Pokémon</h2>
            <p>Click the ❤️ button on a Pokémon to add it here.</p>
        </div>
        `;
        return;
    }
    await loadFavouritePokemon();
}

function removeFavouritePokemon(id){
    removeFavourite(id);
    refreshFavouritePage();
}

function toggleFavouriteFromCard(id){
    if(!requireLogin()){
        return;
    }
    const added=toggleFavourite(id);
    const button=document.querySelector(
        `[data-favourite="${id}"]`
    );
    if(button){
        button.innerHTML=added?"❤":"🤍";
    }
}

function getFavouriteHeart(id){
    return isFavourite(id)?"❤":"🤍";
}

function getFavouriteCount(){
    return getUserFavourites().length;
}

function clearFavouritePokemon(){
    if(!requireLogin()){
        return;
    }
    if(!confirm("Remove every favourite Pokémon?")){
        return;
    }
    saveUserFavourites([]);
    favouritePokemon=[];
    filteredPokemon=[];
    favouriteContainer.innerHTML=`
    <div class="message-box">
        <h2>No Favourite Pokémon</h2>
        <p>Click the ❤ button on a Pokémon to add it here.</p>
    </div>
    `;
}

function checkFavouriteAccess(){
    if(!getCurrentUser()){
        favouriteContainer.innerHTML=`
        <div class="message-box">
            <h2>Please Log In</h2>
            <p>You must log in to view your favourite Pokémon.</p>
        </div>
        `;
        return false;
    }
    return true;
}