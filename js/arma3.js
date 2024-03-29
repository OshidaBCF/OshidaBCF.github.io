function parseArmaModpackPreset()
{
	selectedFile = uploadInput.files[0]
	if (selectedFile) {
		var reader = new FileReader()
		reader.readAsText(selectedFile, "UTF-8")
		reader.onload = function (evt) {
			fileContent = evt.target.result
			parser = new DOMParser()
			parsed = parser.parseFromString(fileContent, "text/html")
			modlist = parsed.getElementsByClassName("mod-list")[0].querySelector("table > tbody")
			ignorelist = document.getElementById("ignoreList").value.split('\n')
			dlclist = parsed.getElementsByClassName("dlc-list")
			ignoreIDList = []
			if (ignorelist != "")
			{
				console.log(ignorelist)
				ignorelist.forEach(modID => 
				{
					console.log(modID)
					ignoreIDList.push(modID)
				});
			}

			
			supportSpaceAndDash = document.getElementById("supportSpaceAndDash").checked
			needDLCInString = document.getElementById("needDLCInString").checked
			
			if(dlclist.length == 0)
			{
				needDLCInString = false
			}
			else
			{
				dlclist = dlclist[0].querySelector("table > tbody")
			}
			if (supportSpaceAndDash)
			{
				regex = new RegExp("[^a-zA-Z0-9\-\_\' ]", "g")
			}
			else
			{
				regex = new RegExp("[^a-zA-Z0-9]", "g")
			}

			output = ""
			if (needDLCInString)
			{
				for (var i = 0, row; row = dlclist.rows[i]; i++) {
					dlcName = row.querySelector('[data-type="DisplayName"]').innerHTML
					switch (dlcName) {
						case "Global Mobilization":
							output += "gm;"
						break;
						case "S.O.G. Prairie Fire":
							output += "vn;"
						break;
						case "CSLA Iron Curtain":
							output += "csla;"
						break;
						case "Western Sahara":
							output += "ws;"
						break;
						case "Spearhead 1944":
							output += "spe;"
						break;
					}
				}
			}
			for (var i = 0, row; row = modlist.rows[i]; i++) {
				modName = row.querySelector('[data-type="DisplayName"]').innerHTML
				modName = modName.replace('&amp;', /&/).replace('&lt;', /</).replace('&gt;', />/).replace('&quot;', /'/).replace('&apos;', /"/)
				modName = modName.replaceAll(regex, "")

				if(row.querySelector('[class="from-local"]'))
				{
					console.log(modName + " ignored")
				}

				if(row.querySelector('[class="from-steam"]'))
				{
					console.log(modName + " added")
					modID = row.querySelector('td > a').innerHTML.split("=")[1]
					if (!ignoreIDList.includes(modID))
						output += "@" + modName + ";"
				}
			}
			output = output.replaceAll("  ", " ").slice(0, -1)
			document.getElementById("modString").textContent = output
		}
		reader.onerror = function (evt) {
			console.log("error reading file")
		}
	}
}

function setCBCookie(cb) {
	setCookie(cb.id, cb.checked)
}

function setTACookie(ta) {
	setCookie(ta.id, ta.value.replaceAll("\n", ","))
}

function setCookie(cname, cvalue) {
	document.cookie = cname + "=" + cvalue
}

function getCookie(cname) {
	let decodedCookie = decodeURIComponent(document.cookie)
	let cookieList = decodedCookie.split('; ')
	let returnValue = ""
	cookieList.forEach(cookie => {
		[cookieName, cookieValue] = cookie.split("=")
		if (cookieName == cname)
		{
			returnValue = cookieValue
			return
		}
	});
	return returnValue
}

function copyStringToClipboard()
{
	var copyText = document.getElementById("modString")

	// Select the text field
	copyText.select()
	copyText.setSelectionRange(0, 99999) // For mobile devices

	// Copy the text inside the text field
	copyTextToClipboard(copyText.value)

	document.getElementById("copyStringToClipboardBtn").innerHTML = "Copied"
}

function waitForElm(selector) {
	return new Promise(resolve => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector))
		}

		const observer = new MutationObserver(mutations => {
			if (document.querySelector(selector)) {
				observer.disconnect()
				resolve(document.querySelector(selector))
			}
		})

		observer.observe(document.body, {
			childList: true,
			subtree: true
		})
	})
}

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea")
	textArea.value = text
	document.body.appendChild(textArea)
	textArea.focus()
	textArea.select()

	try {
		var successful = document.execCommand("copy")
		var msg = successful ? "successful" : "unsuccessful"
		console.log("Fallback: Copying text command was " + msg)
	} catch (err) {
		console.error("Fallback: Oops, unable to copy", err)
	}

	document.body.removeChild(textArea)
}
function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text)
		return
	}
	navigator.clipboard.writeText(text).then(
		function() {
		console.log("Async: Copying to clipboard was successful!")
		},
		function(err) {
		console.error("Async: Could not copy text: ", err)
		}
	)
}

waitForElm("#armaModpackFile").then((elm) => {
	uploadInput = elm
})

waitForElm("#ignoreList").then((elm) => {
	elm.textContent = getCookie("ignoreList").replaceAll(",", "\n")
})

waitForElm("#supportSpaceAndDash").then((elm) => {
	elm.checked = getCookie("supportSpaceAndDash") == "true"
})

waitForElm("#needDLCInString").then((elm) => {
	elm.checked = getCookie("needDLCInString") == "true"
})