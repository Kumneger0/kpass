import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { z } from "zod"

import { useKpassContext } from "~context"
import type { signupSchema } from "~utils"

async function registerUser(user: z.infer<typeof signupSchema>, BASEURL: string) {
	const signupUrl = `${BASEURL}/users/new`
	const response = await fetch(signupUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(user)
	})

	if (response.ok)
		return {
			status: "success",
			data: (await response.json()) as typeof user
		} as const
	return {
		status: "failed",
		data: (await response.json()) as { message: string }
	} as const
}

function createUser() {
	const queryClient = useQueryClient()
	const { baseURL } = useKpassContext()
	return useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries()
		},
		mutationKey: ["signup"],
		mutationFn: (data: z.infer<typeof signupSchema>) => {
			return registerUser(data, baseURL)
		}
	})
}

export { createUser }
