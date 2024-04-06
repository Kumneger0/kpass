export {}
console.log("HELLO WORLD FROM BGSCRIPTS")

chrome.runtime.onMessage.addListener(function (
	request: { message: string; data: Record<string, unknown> },
	sender,
	sendResponse
) {
	try {
		chrome.storage.local.set({ formData: request.data }, function () {
			console.log("Data saved")
			sendResponse({ status: "Data saved" })
		})
	} catch (err) {
		console.log(err)
	}

	chrome.windows.create({
		url: chrome.runtime.getURL("tabs/savePassword.html"),
		type: "popup",
		width: 500,
		height: 400
	})
})
