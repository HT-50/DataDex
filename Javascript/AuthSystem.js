// --- ENCRYPTION HELPERS ---
const scramble=(text)=>btoa(text);
const unscramble=(encoded)=>atob(encoded);
// --- MODAL CONTROL ---
function openAuthModal(mode){
    const modal=document.getElementById("auth-modal");
    window.authMode=mode;
    document.getElementById("modal-title").innerText=
    mode==="signup"?
    "Create DataDex Account":
    "Log In";
    const confirmField=document.getElementById("auth-confirm-pass");
    if(confirmField){
        confirmField.style.display=
        mode==="signup"?
        "block":
        "none";
    }
    const switchText=document.getElementById("auth-switch-text");
    if(switchText){
        switchText.innerHTML=
        mode==="signup"
        ?
        `Already have an account?
        <a href="#" onclick="openAuthModal('login');return false;">Log In</a>`
        :
        `Don't have an account?
        <a href="#" onclick="openAuthModal('signup');return false;">Create One</a>`;
    }
    document.getElementById("auth-user").value="";
    document.getElementById("auth-pass").value="";
    if(confirmField){
        confirmField.value="";
    }
    const message=document.getElementById("auth-message");
    if(message){
        message.innerText="";
    }
    modal.style.display="flex";
}

function closeAuthModal(){
    document.getElementById("auth-modal").style.display="none";
}

async function handleAuth(){
    const user=document.getElementById("auth-user").value.trim();
    const pass=document.getElementById("auth-pass").value;
    const confirmField=document.getElementById("auth-confirm-pass");
    if(window.authMode==="signup"){
        if(
            !user||
            !pass||
            !confirmField.value
        ){
            return alert("Fill all fields!");
        }
        if(pass!==confirmField.value){
            return alert("Passwords do not match!");
        }
        if(localStorage.getItem(`user_${user}`)){
            alert("⚠️ SYSTEM ALERT: This username already exists.");
            openAuthModal("login");
            return;
        }
        const userData={
            password:scramble(pass),
            avatar:"../Image/default-avatar.png",
            favourites:[],
            created:Date.now()
        };
        localStorage.setItem(
            `user_${user}`,
            JSON.stringify(userData)
        );
        alert("Account Created Successfully!");
        openAuthModal("login");
    }else{
        const data=JSON.parse(
            localStorage.getItem(`user_${user}`)
        );
        if(
            data&&
            unscramble(data.password)===pass
        ){
            localStorage.setItem(
                "currentUser",
                user
            );
            updateNavUI(user);
            closeAuthModal();
        }else{
            alert("Invalid Login!");
        }
    }
}

function handleChangePassword(){
    const currentPass=document.getElementById("current-pass").value;
    const newPass=document.getElementById("new-pass").value;
    const confirmPass=document.getElementById("confirm-pass").value;
    const username=localStorage.getItem("currentUser");

    if(!username){
        return alert("Please login first!");
    }
    const userData=JSON.parse(
        localStorage.getItem(`user_${username}`)
    );

    if(!userData){
        return alert("User not found!");
    }
    if(
        unscramble(userData.password)!==currentPass
    ){
        return alert("Current password is incorrect!");
    }
    if(newPass.length<4){
        return alert("Password must be at least 4 characters.");
    }
    if(newPass!==confirmPass){
        return alert("Passwords do not match!");
    }
    userData.password=scramble(newPass);
    localStorage.setItem(
        `user_${username}`,
        JSON.stringify(userData)
    );
    alert("Password Updated Successfully!");
    document.getElementById("current-pass").value="";
    document.getElementById("new-pass").value="";
    document.getElementById("confirm-pass").value="";
    closeChangePassModal();
}

function updateNavUI(username){
    const authControls=document.getElementById("nav-auth-controls");
    const profile=document.getElementById("nav-user-profile");
    const navName=document.getElementById("nav-username");
    const avatar=document.getElementById("user-avatar");
    if(authControls){
        authControls.style.display="none";
    }
    if(profile){
        profile.style.display="flex";
    }
    if(navName){
        navName.innerText=username;
    }
    const userData=JSON.parse(
        localStorage.getItem(`user_${username}`)
    );
    if(
        avatar&&
        userData
    ){
        avatar.src=userData.avatar||"../Image/default-avatar.png";
    }
}

function syncProfileImage(){
    const username=localStorage.getItem("currentUser");
    if(!username){
        return;
    }
    const userData=JSON.parse(
        localStorage.getItem(`user_${username}`)
    );
    if(!userData){
        return;
    }
    const avatar=document.getElementById("user-avatar");
    if(avatar){
        avatar.src=
        userData.avatar||
        "../Image/default-avatar.png";
    }
}

function setProfileImage(image){
    const username=localStorage.getItem("currentUser");
    if(!username){
        return;
    }
    const userData=JSON.parse(
        localStorage.getItem(`user_${username}`)
    );
    if(!userData){
        return;
    }
    userData.avatar=image;
    localStorage.setItem(
        `user_${username}`,
        JSON.stringify(userData)
    );
    syncProfileImage();
}

function getCurrentUser(){
    return localStorage.getItem("currentUser");
}

function getCurrentUserData(){
    const username=getCurrentUser();
    if(!username){
        return null;
    }
    return JSON.parse(
        localStorage.getItem(`user_${username}`)
    );
}

function saveCurrentUserData(data){
    const username=getCurrentUser();
    if(!username){
        return;
    }
    localStorage.setItem(
        `user_${username}`,
        JSON.stringify(data)
    );
}
// Save user favourite Pokémon ❤️
function getUserFavourites(){
    const data=getCurrentUserData();
    if(!data){
        return [];
    }
    if(!Array.isArray(data.favourites)){
        data.favourites=[];
        saveCurrentUserData(data);
    }
    return data.favourites;
}

function saveUserFavourites(list){
    const data=getCurrentUserData();
    if(!data){
        return;
    }
    data.favourites=list;
    saveCurrentUserData(data);
}

function isFavourite(id){
    return getUserFavourites().includes(id);
}

function addFavourite(id){
    if(!getCurrentUser()){
        alert("Please log in first.");
        openAuthModal("login");
        return false;
    }
    const favourites=getUserFavourites();
    if(!favourites.includes(id)){
        favourites.push(id);
        saveUserFavourites(favourites);
    }
    return true;
}

function removeFavourite(id){
    const favourites=getUserFavourites();
    const index=favourites.indexOf(id);
    if(index!==-1){
        favourites.splice(index,1);
        saveUserFavourites(favourites);
    }
}

function toggleFavourite(id){
    if(isFavourite(id)){
        removeFavourite(id);
        return false;
    }
    addFavourite(id);
    return true;
}

function requireLogin(){
    if(getCurrentUser()){
        return true;
    }
    alert("Please log in first.");
    openAuthModal("login");
    return false;
}

function userExists(username){
    return localStorage.getItem(`user_${username}`)!==null;
}

function getUserData(username){
    const data=localStorage.getItem(`user_${username}`);
    if(!data){
        return null;
    }
    return JSON.parse(data);
}

function saveUserData(username,data){
    localStorage.setItem(
        `user_${username}`,
        JSON.stringify(data)
    );
}

function deleteCurrentAccount(){
    const username=getCurrentUser();
    if(!username){
        return;
    }
    if(!confirm("Delete this account permanently?")){
        return;
    }
    localStorage.removeItem(`user_${username}`);
    localStorage.removeItem("currentUser");
    alert("Account deleted successfully.");
    location.reload();
}

function logoutUser(){
    localStorage.removeItem("currentUser");
    location.reload();
}

function changeAvatar(event){
    const file=event.target.files[0];
    if(!file){
        return;
    }
    if(!file.type.startsWith("image/")){
        alert("Please select an image.");
        return;
    }
    const reader=new FileReader();
    reader.onload=function(e){
        setProfileImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

window.addEventListener("load",()=>{
    const username=localStorage.getItem("currentUser");
    if(username){
        updateNavUI(username);
        syncProfileImage();
    }else{
        const authControls=document.getElementById("nav-auth-controls");
        const profile=document.getElementById("nav-user-profile");
        if(authControls){
            authControls.style.display="flex";
        }

        if(profile){
            profile.style.display="none";
        }
    }
});

window.addEventListener("click",(event)=>{
    const authModal=document.getElementById("auth-modal");
    if(
        authModal&&
        event.target===authModal
    ){
        closeAuthModal();
    }
    const changeModal=document.getElementById("change-pass-modal");
    if(
        changeModal&&
        event.target===changeModal
    ){
        closeChangePassModal();
    }
});

document.addEventListener("keydown",(event)=>{
    const authModal=document.getElementById("auth-modal");
    if(
        authModal&&
        authModal.style.display==="block"&&
        event.key==="Enter"
    ){
        handleAuth();
    }
    const changeModal=document.getElementById("change-pass-modal");
    if(
        changeModal&&
        changeModal.style.display==="flex"&&
        event.key==="Enter"
    ){
        handleChangePassword();
    }
});
window.authMode="login";