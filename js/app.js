
Parse.initialize("VvmNgHcupWn43L9ThaNDiIldMSjOXiLvd7DR7wTq", "DTAv28KMYt5pYlY3Q1yDJ3Tvm2FOViL4io9deBBt");
var Parse_Notes = Parse.Object.extend("Notes");
var Private_Parse_Notes = new Parse_Notes();
var syncing=true; //Enabled for the mobile app. 
var parsenoteid;

var defaultnote=["#Welcome to Marknote\n**Clean, easy, markdown notes.**\nClick edit to get started!"];
var newnotetemplate="# New note";
var notes=[];
var current=0;


$(document).on("tap", ".listitem", function(e)
{
	id=$(this).attr("id");
	loadNote(id);
	$( "#listpanel" ).panel( "close" );
});

$(document).on("ready", function()
{
	$("#display").html(marked(defaultnote[0]));
	/*store = new Lawnchair(
	{
		adapter: "dom"
	}, function ()
	{})

	store.exists("notes", function (s)
	{
		if (s===false)
		{
			store.save({key:'notes', notes: defaultnote});
			notes=defaultnote;
		}
		else
		{
		
			store.get("notes", function (n)
			{
				notes=n.notes;
			
			});
		}
	});*/

	login("username", "password");
});


/**
 * Tries to login to Parse.com
 * @param  {string} username Parse.com username.
 * @param  {string} password Parse.com password.
 */
function login(username, password)
{
	Parse.User.logIn(username, password,
	{
		success: function(user)
		{
			currentuser = Parse.User.current();
			if (syncing)
			{
				parse_getnotes();
			}

		},
		error: function(user, error)
		{
			signup(username, password);
		}
	});
}

/**
 * Parse.com signup.
 * @param  {string} username Desired username.
 * @param  {string} password Desired password.
 */
function signup(username, password)
{
	var user = new Parse.User();
	user.set("username", username);
	user.set("password", password);

	user.signUp(null,
	{
		success: function(user)
		{
			login(username, password);
		},
		error: function(user, error)
		{
			if (error.code === 202)
			{
				//$("#syncing").prop("checked", false);
				alert("Username taken or password is incorrect.");
			}
		}
	});
}

/**
 * Syncs notes from Parse.com to local notes array.
 */
function parse_getnotes()
{
	var query = new Parse.Query(Parse_Notes);
	query.find(
	{
		success: function(results)
		{
			if (results.length < 1)
			{
				Private_Parse_Notes.set("content", notes);
				Private_Parse_Notes.setACL(new Parse.ACL(Parse.User.current()));
				Private_Parse_Notes.save(null,
				{
					success: function(parsenote)
					{
						parsenoteid = parsenote.id;
					}
				});
			}
			else
			{
				parsenoteid = results[0].id;
				//if (_.isEqual(notes, results[0].get("content")) === false)
				//{
					notes = results[0].get("content");
					updateList();
				//}
			}
		},
		error: function(error)
		{
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

/**
 * Save local notes array to Parse.com
 */
function parse_savenotes()
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
	//Needed to account for dom update delay. 
	/*setTimeout(function()
	{
		selectItem(current);
	}, 1);*/
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