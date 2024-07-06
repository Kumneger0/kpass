import type { User } from "~types"
import { getUserData, storage } from "~utils"

export {}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
	try {
		chrome.webNavigation.onCommitted.addListener((details) => {
			console.log(details.transitionType, details.url)
			if (["form_submit"].includes(details.transitionType)) {
				chrome.webNavigation.onCompleted.addListener(function onComplete() {
					storage.set("url-to-open-iframe", {
						url: details.url,
						randomUUID: crypto.randomUUID()
					})
				})
			}
		})
	} catch (err) {
		console.log(err)
	}
	if (request.message.content == "openMiniWindow") {
		const url = request.message.url
		const accesstoken = await storage.get("accessToken")
		if (accesstoken) {
			const userData = await getUserData(accesstoken)
			const passwordsOnThisSite = userData?.passwords.filter((p) => p.url == url)
			console.log("passwordsOnThisSite", passwordsOnThisSite)
			const credential = request.data as NonNullable<User["passwords"][number]>
			console.log("credential", credential)
			if (passwordsOnThisSite?.some((p) => p.email == credential.email)) return
		}
		openMiniWindow()
	}
	if (request.message === "shouldIopenIframe") {
		console.log("hellow")
		const status = storage.get("url-to-open-iframe")
		console.log("current status", status)
		storage.watch({
			["url-to-open-iframe"]: (c) => {
				sendResponse({
					event: "open-iframe",
					form_submitedURL: c.newValue.url,
					pageToBeOpenedInIframe: chrome.runtime.getURL("tabs/savepassword.html")
				})
			}
		})
	}
})
function openMiniWindow() {
	chrome.windows.create({
		url: chrome.runtime.getURL("tabs/savePassword.html"),
		type: "popup",
		width: 500,
		height: 400
	})
}
