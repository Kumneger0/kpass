import React, { useState } from "react"

import { signupSchema, userStore, type User } from "./utils"

import "./style.css"

import { error } from "console"
import {
  QueryClient,
  QueryClientProvider,
  useIsMutating,
  useMutation
} from "@tanstack/react-query"
import { z } from "zod"

const BASEURL = "http://localhost:8080"

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <IndexPopup />
    </QueryClientProvider>
  )
}

export default App

function IndexPopup() {
  const user = userStore((state) => state.user)
  const updateUser = userStore((state) => state.setUser)
  const accessToken = userStore((state) => state.accessToken)
  const updateAccessToken = userStore((state) => state.setAccessToken)

  const isLoggedIn = accessToken && user

  return (
    <div className="font-sans w-96 bg-gray-100 rounded-lg shadow-lg flex flex-col    justify-center max-h-fit">
      <h3 className="font-bold text-2xl my-2 p-3">
        KPass Privicy first password manager{" "}
      </h3>
      {!isLoggedIn ? (
        <SignUP />
      ) : (
        <div>
          <div>user logged sucessfully</div>
        </div>
      )}
      <footer>Kpass 2024</footer>
    </div>
  )
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
  throw error(await response.json())
}

function SignUP() {
  const user = userStore((state) => state.user)
  const updateUser = userStore((state) => state.setUser)
  const accessToken = userStore((state) => state.accessToken)
  const updateAccessToken = userStore((state) => state.setAccessToken)
  const formRef = React.useRef<HTMLFormElement>(null)

  const [error, setIsError] = React.useState<string | null>(null)

  // const { data, isError, isPending, mutateAsync } = useMutation({
  //   mutationKey: ["signup"],
  //   mutationFn: (user: Omit<User, "passwords">) => registerUser(user),
  //   onError: (err) => {
  //     console.log(err)
  //   }
  // })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log("clicked")
    const formData = new FormData(formRef.current)
    const body = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      username: formData.get("username"),
      masterPassword: formData.get("masterPassword")
    }

    console.log("BODY", body)

    try {
      const data = signupSchema.parse(body)
      const result = await registerUser(data)
      console.log(result)
      if (result.status === "success") {
        alert("success")
        updateUser(result.data as User)
        return
      }
      alert("failed")
    } catch (err) {
      if (err instanceof Error) {
        setIsError(err.message)
      }
      if (err instanceof z.ZodError) {
        setIsError(JSON.stringify(err.errors))
      }

      console.log(err)
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="my-3 p-3 border-red-600 ">{error}</div>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img
            className="w-8 h-8 mr-2"
            src="https://lorempicsument.com/100/100/"
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
                Already have an account?{" "}
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
