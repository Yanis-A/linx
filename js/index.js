import config from "./config.js";

// Initialisation de Firebase
firebase.initializeApp(config);

// Initialisation des gestionnaires d'événement
$('#logout').on('click', logout);

//Modal
$(document).ready(function(){
    $('.modal').modal();
});

// --------------------------------------------
// AUTH
// --------------------------------------------

// Initialisation des gestionnaires d'événement
$('#loginForm').on('submit', emailPasswordLogin);
$(document).ready(onPageLoad);

// Garde l'utilisateur connecté même après un refresh
function onPageLoad() {
    firebase.auth().onAuthStateChanged(user => {
        if (user !== null) { //On vérifie qu'une session est déja en cours
            $('#logged-in').show();
            console.log(user.email + ' is already logged in.');
        }
        else {
            $('#logged-out').show();
        }
    });
}

function emailPasswordLogin(event) {
    event.preventDefault();

    const email = $('#identifier').val()+'@gmail.com';
    const password = $('#password').val();
    const userLogged = $('#identifier').val();

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(result => {
            $('#logged-out').hide();
            $('#logged-in').show();
            $('.error').hide();

        })
        .catch(error => showError(error)); //Affiche une div avec l'erreur
}

function showError(error) {
    $('.error').html(`<div class="red-text red lighten-4">${error.message}</div>`);
}

//Logout

function logout() {
    firebase.auth().signOut()
    .then(() => {
        $('#logged-out').show();
        $('#logged-in').hide();
    });
}

// --------------------------------------------
// APP
// --------------------------------------------

// Définition de l'identité de l'utilisateur connecté
let userLogged = $('#identifier').val();
let showLogged = `<div class="white-text">Connected as ${userLogged}</div>`

// Initialisation des gestionnaires d'événement
$('#formLinks').on('submit', onAddLink);
$('#cards').on('click', '[data-doc-id]', onDeleteLink);

// Lors de l'ajout d'un lien
function onAddLink (event) {
    event.preventDefault(); // Empeche le rechargement de la page

    // Récupération des valeurs des champs <input>
    const title = $('#linkTitle').val();
    const url = $('#linkUrl').val();
    const description = $('#linkDesc').val();

    // Ajout dans la base du nouveau lien
    firebase.firestore().collection('links').add({
        title: title,
        url: url,
        description: description
    }).finally(() => {
        // Dès que l'opération est terminée
        $('#formLinks')[0].reset(); // Reset du formulaire
        window.location.reload();
    });
}

// Lors de la suppression d'un lien
function onDeleteLink (event) {

    event.preventDefault();

    const id = $(this).attr('data-doc-id');

    const docRef = firebase.firestore().collection('links').doc(id);
    docRef.get()
        .then(linkObj => {
            if (!linkObj.exists) {
                throw new Error('This card doesn\'t exist!');
            }
        })
        .then(() => docRef.delete()
    )
}

// Template
const linksRef = firebase.firestore().collection('links');

linksRef.onSnapshot(querySnapshot => {
    $('#cards').empty();
    querySnapshot.forEach(item => {

        let { title, url, description} = item.data();
        let docID = item.id;
        
        let template = `<div class="col l4 m6 s12">
        <div class="card blue lighten-5">
            <div class="card-content black-text">
                <span class="card-title">${title}</span>
                <a class="waves-effect waves-light btn orange lighten-1 card-link" href="${url}" target="_blank">Link</a>
                <p class="card-description">${description}</p>
            </div>
            <div class="card-action">
                <button title="Delete this card" class="btn-flat red-text" data-doc-id="${docID}">Delete</button>
            </div>
        </div>
    </div>`;

        $('#cards').append(template);
    });
});
