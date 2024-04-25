//@ts-expect-error
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { create } from "zustand"

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

const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{6,20}$/

const emailRegExp = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim

export const passwordSchema = z.object({
	username: z.string().optional().nullable(),
	url: z.string().url({ message: "Invalid url" }),
	email: z.string(),
	phoneNumber: z.string().optional().nullable(),
	password: z.string()
})

export const signupSchema = z.object({
	email: z.string().email().regex(emailRegExp, { message: "Invalid email" }),
	masterPassword: z
		.string()
		.regex(passwordRegExp, {
			message:
				"A password must contain at least one lowercase letter, one uppercase letter, one digit, one special character  be between 6 and 20 characters in length"
		})
		.min(6)
		.max(20)
})
export const loginSchema = z.object({
	email: z.string().email().regex(emailRegExp, { message: "Invalid email" }),
	masterPassword: z.string().min(6).max(20)
})

export interface User extends Omit<z.infer<typeof signupSchema>, "masterPassword"> {
	passwords: Password[]
}

type UserStore = {
	user: User | null
	setUser: (user: User | null) => void
}

export const userStore = create<UserStore>((set) => ({
	user: null,
	setUser: (user: User | null) => set(() => ({ user }))
}))

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
