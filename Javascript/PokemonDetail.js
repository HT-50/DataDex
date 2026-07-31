// Read the Pokémon id from the URL, for example: Detail.html?id=25.
const id = new URLSearchParams(window.location.search).get("id");

fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
.then(response => response.json())
.then(showPokemon);

// Turn names such as "mr-mime" into "Mr-Mime".
function prettyName(name){
    return name.replace(/(^|[\s-])[a-z]/g,c=>c.toUpperCase());
}

// Put the API data into the matching HTML elements.
function showPokemon(data){
    document.getElementById("name").textContent=prettyName(data.name);
    document.getElementById("image").src=
    data.sprites.other["official-artwork"].front_default ||
    data.sprites.front_default;
    document.getElementById("height").textContent=
    data.height/10+" m";
    document.getElementById("weight").textContent=
    data.weight/10+" kg";
    document.getElementById("types").innerHTML=
    data.types.map(t=>
        `<span class="pokemon-type type-${t.type.name}">
            ${prettyName(t.type.name)}
        </span>`
    ).join(" ");
    document.getElementById("stats").innerHTML=
    data.stats.map(stat=>`
        <div class="stat">
            <span>${prettyName(stat.stat.name)}</span>
            <div class="bar">
                <div class="fill"
                    style="width:${Math.min(stat.base_stat,150)/150*100}%">
                </div>
            </div>
            <strong>${stat.base_stat}</strong>
        </div>
    `).join("");
}

function updateFavouriteButton(){
    const button=document.getElementById("detailFavourite");
    button.style.visibility="visible";
    const btn=document.getElementById("detailFavourite");
    if(!btn){
        return;
    }
    if(isFavourite(Number(id))){
        btn.innerHTML="❤️";
        btn.classList.add("active");
    }else{
        btn.innerHTML="🤍";
        btn.classList.remove("active");
    }
}

document.getElementById("detailFavourite").onclick=function(){
    if(!requireLogin()){
        return;
    }
    toggleFavourite(Number(id));
    updateFavouriteButton();
};
setTimeout(updateFavouriteButton,500);