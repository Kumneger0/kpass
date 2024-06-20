import type { z } from "zod"

import type { signupSchema } from "~utils"

export type AccessToken = string | null

export interface Password {
	ID?: string
	id: number
	sitename: string
	url: string
	email: string
	phoneNumber: string
	password: string
}
export interface User extends Omit<z.infer<typeof signupSchema>, "masterPassword"> {
	passwords: Password[]
}
export type UserStore = {
	user: User | null
	setUser: (user: User | null) => void
}
