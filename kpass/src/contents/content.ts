import React from "react"
import { createRoot } from "react-dom/client"

import App from "../components/App"

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
const kpassContainer = document.createElement("div")
if (parentElement && inputElements.some(ele => ele.type == 'password')) {
	kpassContainer.id = "kpass-container"
	parentElement.appendChild(kpassContainer)
}

const root = createRoot(kpassContainer)
root.render(React.createElement(App, null, null))
export {}
