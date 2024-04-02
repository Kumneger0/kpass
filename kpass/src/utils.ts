import { z } from "zod"
import { create } from "zustand"

type AccessToken = string | null

interface Password {
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

export const signupSchema = z.object({
  username: z.string().min(5).max(20),
  firstName: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20),
  email: z.string().email().regex(emailRegExp, { message: "Invalid email" }),
  masterPassword: z
    .string()
    .regex(passwordRegExp, {
      message:
        "A password must contain at least one lowercase letter, one uppercase letter, one digit, one special character  be between 6 and 20 characters in length"
    })
    .min(8)
    .max(20)
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
  accessToken: null,
  setUser: (user: User | null) => set(() => ({ user })),
  setAccessToken: (accessToken: AccessToken) => set(() => ({ accessToken }))
}))
