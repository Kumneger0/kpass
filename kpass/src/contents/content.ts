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

inputElements.forEach((ele) => {
	const placeHolderDiv = document.createElement("div")
	const kpassContainer = document.createElement("div")
	addStyles(ele.parentElement)
	addKpassLogo(kpassContainer)
	ele?.parentElement?.appendChild(placeHolderDiv)
	ele.after(placeHolderDiv, kpassContainer)
	const root = createRoot(kpassContainer)
	root.render(React.createElement(App, { elements: inputElements }, null))
})

function addStyles(ele: HTMLElement | null) {
	if (!ele) return
	ele.style.position = "relative"
}

function addKpassLogo(kpassContainer: HTMLElement) {
	kpassContainer.style.position = "absolute"
	kpassContainer.style.right = "0"
	kpassContainer.style.top = "-15px"
}
function isInKey<Tobj extends object>(obj: Tobj, key: PropertyKey): key is keyof Tobj {
	return key in obj
}
document.onsubmit = async (e) => {
	const formValue = getSubmittedUserInputs()
	try {
		Object.keys(formValue).forEach((key) => {
			if (isInKey(formValue, key)) {
				if (formValue[key] === "") {
					delete formValue[key]
				}
			}
		})
		const result = passwordSchema.parse(formValue)
		await storage.set("credential", formValue)
		chrome.runtime.sendMessage({ message: "setTopic", data: Credential }, function (response) {
			console.log("response", response)
		})
	} catch (err) {
		console.log(err)
		if (err instanceof Error) {
			console.log(err.message)
		}
		if (err instanceof ZodError) {
			console.log(err.errors[0].message)
		}
	}
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
