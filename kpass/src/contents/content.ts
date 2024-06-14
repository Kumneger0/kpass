import { ZodError } from "zod"

import { storage } from "~popup"
import { getUserData } from "~tabs/home"
import { passwordSchema, type User } from "~utils"
//@ts-expect-error Cannot find module '../../assets/icon.png' or its corresponding type declarations.ts(2307)
import logo from "../../assets/icon.png"

const supportedInputTypes = ["text", "password", "email", "tel"]
const inputElementToFill: HTMLInputElement[] = []

const revalidateToken = async () => {
	const accessToken = await storage.get("accessToken")

	if (!accessToken) return null

	const result = await getUserData(accessToken)

	if ("isError" in result && typeof result.isError == "boolean" && result.isError) {
		await storage.remove("accessToken")
	}
	return accessToken
}

revalidateToken()
// addIcon()

const dialog = document.createElement("dialog")
dialog.style.position = "absolute"
dialog.style.width = "300px"
dialog.style.maxHeight = "300px"
dialog.style.height = "auto"
dialog.style.padding = "5px"
dialog.style.borderRadius = "20px"
dialog.style.top = "50%"
dialog.style.left = "50%"
dialog.style.zIndex = "1000"
dialog.style.transform = "translate(-50%, -50%)"
dialog.style.border = "2px solid black"

dialog.open = false
document.body.appendChild(dialog)

function addIcon() {
	const inputs = document.querySelectorAll("input")

	inputs.forEach((elem) => {
		if (!supportedInputTypes.includes(elem.type)) return

		if (elem.parentElement) {
			inputElementToFill.push(elem)

			const span = document.createElement("span")
			const img = document.createElement("img")
			img.setAttribute("src", logo)
			img.setAttribute("width", "30px")
			img.setAttribute("height", "30px")

			revalidateToken().then((token) => {
				if (token) {
					img.style.opacity = "0.5"
				}
			})

			img.style.borderRadius = "50%"

			span.appendChild(img)
			span.style.position = "absolute"
			span.style.right = "8px"
			span.style.top = "15px"
			span.style.cursor = "pointer"

			img.onclick = async () => {
				const token = await storage.get("accessToken")

				if (!token) return

				const userData = await getUserData(token)

				if (dialog.open) {
					dialog.close()
					return
				}

				showPasswordsInModal(
					userData.passwords.filter(({ url }) => url === location.origin),
					elem
				)
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

export function isInKey<Tobj extends object>(obj: Tobj, key: PropertyKey): key is keyof Tobj {
	return key in obj
}

document.onsubmit = async (e) => {
	const crendentials = getInputElements()
	try {
		Object.keys(crendentials).forEach((key) => {
			if (isInKey(crendentials, key)) {
				if (crendentials[key] === "") {
					delete crendentials[key]
				}
			}
		})
		passwordSchema.parse(crendentials)
		await storage.set("credential", crendentials)
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

function showPasswordsInModal(passwords: User["passwords"], elem: HTMLInputElement) {
	const div = document.createElement("div")
	div.style.display = "flex"
	div.style.flexDirection = "column"
	div.style.alignItems = "center"
	div.style.justifyContent = "center"
	div.style.padding = "20px"
	div.style.backgroundColor = "#f0f0f0"
	div.style.borderRadius = "10px"
	div.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"

	passwords.length
		? passwords.forEach((pass) => {
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

				const arrs = [
					Object.keys(pass)
						.map((key) => {
							if (
								key.toLowerCase().trim() !== "email" &&
								key.toLowerCase().trim() !== "username" &&
								key.toLowerCase().trim() !== "password"
							)
								return

							if (pass[key as keyof typeof pass] == "" || !pass[key as keyof typeof pass]) return

							return {
								type: key.toLowerCase(),
								value: pass[key as keyof typeof pass]
							}
						})
						.filter((v) => !!v)?.[0]
				] as Array<{ type: string; value: string }>

				console.log(arrs)

				arrs.map(({ value, type }) => {
					if (type == "password") return
					const span = document.createElement("span")
					span.innerText = value as string
					span.style.fontSize = "16px"
					span.style.color = "black"

					console.log("value", value)

					passEleme.appendChild(span)
				})

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

				passEleme.appendChild(button)

				button.onclick = () => {
					inputElementToFill.forEach((input) => {
						if (input.type.toLowerCase().trim() == "password") {
							input.value = pass.password
							return
						}
						input.value = pass.email
					})

					dialog.close()
				}

				div.appendChild(passEleme)
			})
		: (() => {
				const emptyNoTifierDiv = document.createElement("div")
				emptyNoTifierDiv.innerText = "No Saved Password availible for this site"
				div.replaceChildren(emptyNoTifierDiv)
			})()

	const button = document.createElement("button")
	button.style.color = "white"

	button.style.width = "100%"
	button.style.padding = "20px"
	button.style.borderRadius = "10px"
	button.style.backgroundColor = "red"
	button.style.margin = "10px"

	button.onclick = () => {
		dialog.close()
	}
	dialog.replaceChildren(div)
	dialog.open = true

	!dialog.open && dialog.showModal()
}

export {}
