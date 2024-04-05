import { ZodError } from "zod"

import { storage } from "~popup"
import { passwordSchema } from "~utils"

export {}

const supportedInputTypes = ["text", "password", "email", "tel"]

const getInputElements = () => {
	const crendentials = {
		url: location.origin,
		email: "",
		password: "",
		phoneNumber: "",
		username: ""
	}
	document.querySelectorAll("input").forEach((elem) => {
		if (!supportedInputTypes.includes(elem.type)) return

		if (elem.type == "password") {
			crendentials.password = elem.value
			return
		}
		crendentials[elem.name] = elem.value
	})
	return crendentials
}

document.onsubmit = async (e) => {
	const crendentials = getInputElements()

	try {
		const result = passwordSchema.parse(crendentials)
		Object.keys(crendentials).forEach((key) => {
			if (crendentials[key] === "") {
				delete crendentials[key]
			}
		})

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
