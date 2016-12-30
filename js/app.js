// Firebase setup.
var config = {
	apiKey: "AIzaSyDtYLpfW_yRF273-N6iwZDHDX7xG8Nt5_g",
	authDomain: "marknote-681e3.firebaseapp.com",
	databaseURL: "https://marknote-681e3.firebaseio.com",
	storageBucket: "marknote-681e3.appspot.com",
	messagingSenderId: "809473583891"
};
firebase.initializeApp(config);

var syncing=true; //Enabled for the mobile app.
var parsenoteid;

var defaultnote=['<input type="text" id="username">\n<input type="password" id="password">\n<a href="#" id="loginButton" class="ui-btn">Login</a>'];
var newnotetemplate="# New note";
var notes=[];
var current=0;

$(document).on("tap", ".listitem", function(e)
{
	var id = $(this).attr("id");
	loadNote(id);
	$( "#listpanel" ).panel( "close" );
});

$(document).on("ready", function()
{
	$(document).on("click", "#loginButton", function()
	{
		username=$("#username").val();
		password=$("#password").val();
		login(username, password);
	});
	$("#logoutButton").on("click", function()
	{
		firebase.auth().signOut().then(function() {
			notes = defaultnote;
			updateList();
			current = 0;
			loadNote(0);

		});
	});

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			cloud_getnotes();
		}
	});
});

/**
 * Tries to login to Firebase
 * @param  {string} username Parse.com username.
 * @param  {string} password Parse.com password.
 */
function login(username, password)
{
	firebase.auth().signInWithEmailAndPassword(username, password).then(function() {
		cloud_getnotes();
	}).catch(function(error) {
		signup(username, password);
	});
}

/**
 * Firebase signup.
 * @param  {string} username Desired username.
 * @param  {string} password Desired password.
 */
function signup(username, password)
{
	firebase.auth().createUserWithEmailAndPassword(username, password).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;

		$("#syncing").prop("checked", false);
		alert("Username taken or password is incorrect.");
	});
}

/**
 * Syncs notes from Parse.com to local notes array.
 */
function cloud_getnotes()
{
	var userId = firebase.auth().currentUser.uid;
	firebase.database().ref('/notes/' + userId).once('value').then(function(snapshot) {
		if (snapshot.val()) {
			notes = snapshot.val();
			// preloadCache(); //Update the cache.
			updateList(); //Update the list.
			loadNote(current); //Update the note you're currently viewing.
		} else {
			// cloud_savenotes();
		}
	});
}

/**
 * Save local notes array to Parse.com
 */
function cloud_savenotes()
{
	var query = new Parse.Query(Parse_Notes);
	query.get(parsenoteid,
	{
		success: function(n)
		{
			n.set("content", notes);
			n.save();
		}
	});
}

/**
 * Updates the list of notes then highlights the current note.
 */
function updateList()
{
	$("#list").html("");
	for (var i in notes)
	{
		addNote(notes[i].split("\n")[0], i);
	}
	$("#list").listview("refresh");
}

/**
 * Displays a note from cache and selects it in the list.
 * @param  {id} id Note ID.
 * @param  {boolean} select If true, highlights the loaded note in the list.
 */
function loadNote(id)
{
	current = id;
	markdown = notes[id];
	$("#display").html(marked(markdown));
	$("#display").trigger('create');
}

/**
 * Adds list-item to the notes list.
 * @param {string} note Note's markdown, the top line is used to create the title.
 * @param {int} id   Note ID.
 */
function addNote(note, id)
{
	template = "<li class=\"listitem\" id=\"{{id}}\">{{note}}</li>";
	item = template.replace("{{note}}", getTitle(note)).replace("{{id}}", id);
	$("#list").append(item);
}

/**
 * Generates the title by stripping non-alphabetical characters.
 * @param  {string} note Markdown to turn into a title.
 */
function getTitle(note)
{
	return note.split("\n")[0].replace(/\W+/g, " ");
}
