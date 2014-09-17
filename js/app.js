
Parse.initialize("VvmNgHcupWn43L9ThaNDiIldMSjOXiLvd7DR7wTq", "DTAv28KMYt5pYlY3Q1yDJ3Tvm2FOViL4io9deBBt");
var Parse_Notes = Parse.Object.extend("Notes");
var Private_Parse_Notes = new Parse_Notes();
var syncing;
var parsenoteid;

var defaultnote=["#Welcome to Marknote\n**Clean, easy, markdown notes.**\nClick edit to get started!"];
var newnotetemplate="# New note";
var notes=[];



$(document).on("ready", function()
{
	$("#display").html(marked(defaultnote[0]));
	store = new Lawnchair(
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
	});
});

