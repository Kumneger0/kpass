import { z } from "zod"
import { create } from "zustand"

type AccessToken = string | null

export interface Password {
  id: number
  sitename: string
  url: string
  email: string
  phoneNumber: string
  password: string
}

const passwordRegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{6,20}$/

const emailRegExp = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim

export const passwordSchema = z.object({
  username: z.string(),
  url: z.string().url({ message: "Invalid url" }),
  email: z.string().email().regex(emailRegExp, { message: "Invalid email" }),
  phoneNumber: z.string().optional(),
  password: z.string()
})

export const signupSchema = z.object({
  username: z
    .string()
    .min(5, { message: "username should be at least 5 charaters" })
    .max(20, { message: "username should not exced 20 charaters" }),
  firstName: z
    .string()
    .min(2, { message: "firstname  should be at least 2 charaters" })
    .max(20, {
      message: "first should not exced 20 charaters"
    }),

  lastName: z
    .string()
    .min(2, { message: "lastname  should be at least 2 charaters" })
    .max(20, {
      message: "lastname should not exced 20 charaters"
    }),
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

export interface User
  extends Omit<z.infer<typeof signupSchema>, "masterPassword"> {
  passwords: Password[]
}

type UserStore = {
  accessToken: AccessToken
  user: User | null
  setUser: (user: User | null) => void
  setAccessToken: (accessToken: AccessToken) => void
}

export const userStore = create<UserStore>((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  setUser: (user: User | null) => set(() => ({ user })),
  setAccessToken: (accessToken: AccessToken) => set(() => ({ accessToken }))
}))
