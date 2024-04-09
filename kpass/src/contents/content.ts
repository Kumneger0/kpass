import { object, string, ZodError } from "zod"

import { storage } from "~popup"
import { passwordSchema } from "~utils"

export {}

const supportedInputTypes = ["text", "password", "email", "tel"]

addIcon()

const dialog = document.createElement("dialog")
dialog.style.position = "absolute"
dialog.style.width = "300px"
dialog.style.height = "300px"
dialog.style.padding = "5px"
dialog.style.borderRadius = "50px"
dialog.style.top = "50%"
dialog.style.left = "50%"
dialog.style.zIndex = "1000"
dialog.style.transform = "translate(-50%, -50%)"

dialog.open = false
document.body.appendChild(dialog)

function addIcon() {
	const inputs = document.querySelectorAll("input")

	inputs.forEach((elem) => {
		console.log("adding")
		if (!supportedInputTypes.includes(elem.type)) return

		if (elem.parentElement) {
			const span = document.createElement("span")
			const img = document.createElement("img")
			img.setAttribute(
				"src",
				"https://img.freepik.com/free-vector/watercolor-women-s-day-background_23-2151254843.jpg?w=1060&t=st=1712584054~exp=1712584654~hmac=723275b381b7989ed25064a6582d653ce2a4a74949dd42e04658216e2305d9b6"
			)
			img.setAttribute("width", "30px")
			img.setAttribute("height", "30px")

			img.style.borderRadius = "50%"

			span.appendChild(img)
			span.style.position = "absolute"
			span.style.right = "8px"
			span.style.top = "15px"

			img.onclick = () => {
				const passwords = ["password1", "password2", "password3", "password4"]
				showPasswordsInModal(passwords, elem)
			}

			elem.parentElement.style.position = "relative"

			elem.parentElement.appendChild(span)
		}
	})
}

const getInputElements = () => {
	const crendentials = {
		url: location.origin,
		email: "",
		password: "",
		phoneNumber: "",
		username: ""
	}
	const inputs = document.querySelectorAll("input")

	inputs.forEach((elem) => {
		if (!supportedInputTypes.includes(elem.type)) return

		if (elem.type == "password") {
			crendentials.password = elem.value

			return
		}
		const name = elem.name
		const keys = Object.keys(crendentials).map((str) => str.toLowerCase())
		if (keys.includes(name.toLowerCase())) {
			crendentials[name as keyof typeof crendentials] = elem.value
		}
	})
	return crendentials
}

function isInKey<Tobj extends object>(obj: Tobj, key: PropertyKey): key is keyof Tobj {
	return key in obj
}

document.onsubmit = async (e) => {
	e.preventDefault()
	const crendentials = getInputElements()
	try {
		Object.keys(crendentials).forEach((key) => {
			if (isInKey(crendentials, key)) {
				if (crendentials[key] === "") {
					delete crendentials[key]
				}
			}
		})
		const result = passwordSchema.parse(crendentials)
		await storage.set("credential", crendentials)
		chrome.runtime.sendMessage({ message: "setTopic", data: Credential }, function (response) {
			console.log("response", response)
		})
	} catch (err) {
		console.log(err)
		if (err instanceof Error) {
			alert(err.message)
		}
		if (err instanceof ZodError) {
			alert(err.errors[0].message)
		}
	}
}

function showPasswordsInModal(passwords: Array<string>, elem: HTMLInputElement) {
	const div = document.createElement("div")
	div.style.display = "flex"
	div.style.flexDirection = "column"
	div.style.alignItems = "center"
	div.style.justifyContent = "center"
	div.style.padding = "20px"
	div.style.backgroundColor = "#f0f0f0"
	div.style.borderRadius = "10px"
	div.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"

	passwords.forEach((pass) => {
		const passEleme = document.createElement("div")
		passEleme.style.display = "flex"
		passEleme.style.justifyContent = "space-between"
		passEleme.style.alignItems = "center"
		passEleme.style.width = "100%"
		passEleme.style.padding = "10px"
		passEleme.style.marginBottom = "10px"
		passEleme.style.backgroundColor = "#ffffff"
		passEleme.style.borderRadius = "5px"
		passEleme.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"

		const span = document.createElement("span")
		span.innerText = pass
		span.style.fontSize = "16px"
		span.style.color = "#333"

		const button = document.createElement("button")
		button.innerText = "select"
		button.style.padding = "8px 16px"
		button.style.backgroundColor = "#007bff"
		button.style.color = "#fff"
		button.style.border = "none"
		button.style.borderRadius = "5px"
		button.style.cursor = "pointer"
		button.style.transition = "background-color 0.3s ease"

		button.onmouseover = () => (button.style.backgroundColor = "#0056b3")
		button.onmouseout = () => (button.style.backgroundColor = "#007bff")

		passEleme.appendChild(span)
		passEleme.appendChild(button)

		button.onclick = () => {
			elem.value = pass
			dialog.close()
		}

		div.appendChild(passEleme)
	})

	dialog.replaceChildren(div)
	dialog.open = true
	dialog.showModal()
}
