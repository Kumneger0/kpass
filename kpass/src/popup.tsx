import React, { createContext, useContext, useEffect, useState } from "react"

import { loginSchema, signupSchema, userStore, type User } from "./utils"

import "./style.css"

import { z } from "zod"

const BASEURL = "http://localhost:8080"

const LoginContext = createContext<{
  isLogin: boolean
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>
}>(null)

const App = () => {
  const [isLogin, setIsLogin] = useState(false)

  return (
    <LoginContext.Provider value={{ isLogin, setIsLogin }}>
      <div className="w-96 mx-auto">
        <h3 className="font-bold text-2xl my-2 p-3">
          KPass Privicy first password manager{" "}
        </h3>
        <IndexPopup />
        <footer className="font-bold text-center my-3 p-3 text-lg">
          Kpass 2024
        </footer>
      </div>
    </LoginContext.Provider>
  )
}

export default App

function IndexPopup() {
  const user = userStore((state) => state.user)
  const updateUser = userStore((state) => state.setUser)
  const accessToken = userStore((state) => state.accessToken)
  const { isLogin } = useContext(LoginContext)

  useEffect(() => {
    const url = `${BASEURL}/passwords`
    const getUserData = async () => {
      const response = await fetch(url, {
        headers: {
          ACCESS_TOKEN: accessToken
        }
      })
      if (response.ok) {
        const data = (await response?.json()) as User
        updateUser(data)
      }
    }
    if (accessToken) getUserData()
  }, [accessToken])

  if (!!accessToken)
    return <div>{user ? <div>
      <a href = "/tabs/home.html" target="_blank">home</a>
    </div> : "logged in"}</div>

  if (isLogin) return <Login />

  return <SignUP />
}

async function registerUser(user: z.infer<typeof signupSchema>) {
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

function SignUP() {
  const { setIsLogin } = useContext(LoginContext)

  const formRef = React.useRef<HTMLFormElement>(null)
  const [error, setIsError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassWord, setShowPassword] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(formRef.current)
    const body = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      username: formData.get("username"),
      masterPassword: formData.get("masterPassword")
    }

    try {
      const data = signupSchema.parse(body)
      const result = await registerUser(data)
      if (result?.status === "success") {
        setIsLogin(true)
        return
      }
      setIsError(result?.data.message)
    } catch (err) {
      if (err instanceof Error) {
        setIsError(err.message)
      }
      if (err instanceof z.ZodError) {
        setIsError(err.errors[0].message)
      }
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div>loading</div>
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      {error && (
        <div className="my-3 p-3 text-lg text-red-600 border">{error}</div>
      )}
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img
            className="w-20 h-20 rounded-[999999999px] mr-2"
            src="https://picsum.photos/200/300"
            alt="logo"
          />
          KPass
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create and account
            </h1>
            <form
              ref={formRef}
              className="space-y-4 md:space-y-6"
              action="#"
              onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="username"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="firstname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Firstname
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstname"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="firstname"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  lastname
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastname"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="lastname"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Email"
                  required
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Master Password
                </label>
                <input
                  type={showPassWord ? "text" : "password"}
                  name="masterPassword"
                  id="password"
                  placeholder="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
                <button
                  className="absolute inset-y-0 top-5 right-0 flex items-center pr-2 pointer-events-none"
                  type="button"
                  onClick={() => setShowPassword((prv) => !prv)}>
                  e
                </button>
              </div>

              <div className="flex items-start">
                <div className="flex items-center">
                  <input
                    id="terms"
                    aria-describedby="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="terms"
                    className="font-light text-gray-500 dark:text-gray-300">
                    I accept the{" "}
                    <a
                      className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                      href="#">
                      Terms and Conditions
                    </a>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                Create an account
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

async function LoginUser(user: z.infer<typeof signupSchema>) {
  const loginURL = `${BASEURL}/users/login`
  const response = await fetch(loginURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  })

  if (response.ok)
    return {
      status: "success",
      data: (await response.json()) as { accessToken: string }
    } as const
  return {
    status: "failed",
    data: (await response.json()) as { message: string }
  } as const
}

function Login() {
  const formRef = React.useRef<HTMLFormElement>(null)
  const updateAccessToken = userStore((state) => state.setAccessToken)
  const [error, setIsError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassWord, setShowPassword] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(formRef.current)
    const body = {
      email: formData.get("email"),
      masterPassword: formData.get("masterPassword")
    }

    try {
      const data = loginSchema.parse(body)
      const result = await LoginUser(data)
      if (result?.status === "success") {
        updateAccessToken(result?.data.accessToken)
        localStorage.setItem("accessToken", result?.data.accessToken)
        return
      }
      setIsError(result?.data.message)
    } catch (err) {
      if (err instanceof Error) {
        setIsError(err.message)
      }
      if (err instanceof z.ZodError) {
        setIsError(err.errors[0].message)
      }
    }
    setIsLoading(false)
  }

  if (isLoading) return <div>loading</div>

  return (
    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      {error && (
        <div className="my-3 p-3 text-lg text-red-600 border">{error}</div>
      )}
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Login
        </h1>

        <form
          onSubmit={handleSubmit}
          ref={formRef}
          className="space-y-4 md:space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Master Password
            </label>
            <input
              type="password"
              name="masterPassword"
              id="password"
              placeholder="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
            login
          </button>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            new to kpass ?{" "}
            <a
              href="#"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500">
              sign up here
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
