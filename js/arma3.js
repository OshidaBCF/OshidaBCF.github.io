function parseArmaModpackPreset()
{
	selectedFile = uploadInput.files[0];
	if (selectedFile) {
		var reader = new FileReader();
		reader.readAsText(selectedFile, "UTF-8");
		reader.onload = function (evt) {
			fileContent = evt.target.result
			parser = new DOMParser();
			parsed = parser.parseFromString(fileContent, "text/html");
			modlist = parsed.getElementsByClassName("mod-list")[0].querySelector("table > tbody")
			
			output = ""
			regex = new RegExp("[^a-zA-Z0-9]", "g");
			for (var i = 0, row; row = modlist.rows[i]; i++) {
				modName = row.querySelector('[data-type="DisplayName"]').innerHTML

				modName = modName.replaceAll(regex, "")
				output += "@" + modName + ";"
			}
			output = output.slice(0, -1)
			document.getElementById("modString").textContent = output
		}
		reader.onerror = function (evt) {
			console.log("error reading file");
		}
	}
}

function waitForElm(selector) {
	return new Promise(resolve => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver(mutations => {
			if (document.querySelector(selector)) {
				observer.disconnect();
				resolve(document.querySelector(selector));
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	});
}

waitForElm("body > button").then((elm) => {
	uploadInput = document.getElementById("armaModpackFile")
});