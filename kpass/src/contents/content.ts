import React from "react"
import { createRoot } from "react-dom/client"
import { ZodError } from "zod"

import { passwordSchema, storage } from "~utils"

import App from "../contentComponent/App"

const supportedInputTypes = ["text", "password", "email", "tel"]
function getInputElemnteReferece() {
	const inputs = document.querySelectorAll("input")
	const inputElementToFill: HTMLInputElement[] = []
	inputs.forEach((elem) => {
		if (!supportedInputTypes.includes(elem.type)) return
		if (elem.parentElement) {
			inputElementToFill.push(elem)
		}
	})
	return inputElementToFill
}
function isParent(parent: Element | null, child: HTMLInputElement) {
	if (!parent) return false
	return parent.contains(child)
}

function getCommonParentElement(element: Element | null, elements: HTMLInputElement[]) {
	if (!element) return null
	if (elements.length == 1) return element.parentElement
	const parent = element.parentElement
	let isCorrect
	for (let node of elements) {
		if (!isParent(parent, node)) {
			isCorrect = false
			break
		}
		isCorrect = true
	}
	if (isCorrect) return parent
	return getCommonParentElement(parent, elements)
}

const inputElements = getInputElemnteReferece()
const parentElement = inputElements.length
	? getCommonParentElement(inputElements[0], inputElements)
	: null

injectKpass(inputElements)

function injectKpass(inputElements: HTMLInputElement[]) {
	// const shouldStopAdding = inputElements.every(
	// 	(ele) => ele.type !== "password" || ele.type !== "email"
	// )
	// if (shouldStopAdding) return
	inputElements.forEach((ele) => {
		{
			if (ele.type == "email" || ele.type == "password") {
				const initalWidth = ele.width
				const inputWrapper = document.createElement("div")
				const kpassContainer = document.createElement("div")
				addStyles(inputWrapper, ele?.parentElement!)
				addStylesToKpassContainer(kpassContainer, ele)
				ele.parentNode?.insertBefore(inputWrapper, ele)
				inputWrapper.appendChild(ele)
				inputWrapper.appendChild(kpassContainer)
				const root = createRoot(kpassContainer)
				root.render(React.createElement(App, { elements: inputElements, element: ele }, null))
				ele.style.minWidth = initalWidth + "px"
			}
		}
	})
}

function addStyles(ele: HTMLElement | null, parentNode: HTMLElement) {
	if (!ele) return
	ele.style.width = parentNode.style["width"]
	ele.style.position = "relative"
	ele.style.minHeight = "50px"
}

function addStylesToKpassContainer(kpassContainer: HTMLElement, ele: HTMLInputElement) {
	kpassContainer.style.position = "absolute"
	kpassContainer.style.right = "0px"
	kpassContainer.style.top = "-25px"
	ele.style.width = "100%"
	ele.style.boxSizing = "border-box"
}
function isInKey<Tobj extends object>(obj: Tobj, key: PropertyKey): key is keyof Tobj {
	return key in obj
}
document.onsubmit = async () => {
	const formValue = getSubmittedUserInputs()
	if (!formValue.email && !formValue.username && !formValue.password) return
	try {
		Object.keys(formValue).forEach((key) => {
			if (isInKey(formValue, key)) {
				if (formValue[key] === "") {
					delete formValue[key]
				}
			}
		})
		passwordSchema.parse(formValue)
		await storage.set("credential", formValue)
	} catch (err) {
		const currentCredential: Partial<typeof formValue> = {
			url: location.origin,
			email: formValue?.email ?? " ",
			password: formValue.password ?? " ",
			phoneNumber: formValue.phoneNumber ?? " ",
			username: formValue.phoneNumber ?? " "
		}
		await storage.set("credential", currentCredential)
		if (err instanceof Error) {
			console.log(err.message)
		}
		if (err instanceof ZodError) {
			console.log(err.errors[0].message)
		}
	}
	chrome.runtime.sendMessage(
		{
			message: { content: "openMiniWindow", url: location.origin }, data: await storage.get("credential")
		},
		function (response) {
			console.log("response", response)
		}
	)
}
type Respose = {
	event: string
	form_submitedURL: any
	pageToBeOpenedInIframe: string
}

chrome.runtime.sendMessage(
	{ message: "shouldIopenIframe", data: Credential },
	function (response: Respose) {
		if (response.event == "open-iframe" && response.form_submitedURL == location.href) {
			// addIfremeTody(response.pageToBeOpenedInIframe)
		}
	}
)

function addIfremeTody(iframeSrc: string) {
	const iframe = document.createElement("iframe")

	iframe.setAttribute("src", iframeSrc)

	iframe.style.position = "fixed"
	iframe.style.top = "0px"
	iframe.style.right = "0px"
	iframe.style.zIndex = "2147483647"
	iframe.style.border = "none"
	iframe.style.height = "100vh"
	iframe.style.width = "100vw"
	iframe.style.colorScheme = "light"
	iframe.style.maxHeight = "649px"
	iframe.style.maxWidth = "432px"

	document.body.appendChild(iframe)
}
const getSubmittedUserInputs = () => {
	const formValue = {
		url: location.origin,
		email: "",
		password: "",
		phoneNumber: "",
		username: ""
	}
	inputElements.forEach((elem) => {
		if (!supportedInputTypes.includes(elem.type)) return
		if (elem.type == "password") {
			formValue.password = elem.value
			return
		}
		const name = elem.name
		const keys = Object.keys(formValue).map((str) => str.toLowerCase())
		if (keys.includes(name.toLowerCase())) {
			formValue[name as keyof typeof formValue] = elem.value
		}
	})
	return formValue
}
export {}
