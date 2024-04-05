import { object, string, ZodError } from "zod"

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
