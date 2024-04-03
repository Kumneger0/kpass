import { passwordSchema, userStore, type User } from "~utils"

import { Button } from "../components/button"

import "../style.css"

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import React, { useState } from "react"
import { z, ZodError } from "zod"

import { Dialog, DialogContent, DialogTrigger } from "../components/dialog"

const queryClient = new QueryClient()

const Home = () => {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Component />
      </QueryClientProvider>
    </div>
  )
}

export default Home

const BASEURL = "http://localhost:8080"

const getUserData = async (accessToken: string) => {
  const url = `${BASEURL}/passwords`

  const response = await fetch(url, {
    headers: {
      ACCESS_TOKEN: accessToken
    }
  })
  const data = (await response?.json()) as User
  return data
}

function Component() {
  const accessToken = userStore((state) => state.accessToken)

  const {
    isPending,
    error,
    data: user
  } = useQuery({
    queryKey: ["repoData"],
    queryFn: () => getUserData(accessToken)
  })

  console.log(user)

  if (isPending) return "Loading..."

  if (error) return "An error has occurred: " + error.message

  return (
    <div className="grid md:grid-cols-2 gap-4 items-start max-w-3xl mx-auto px-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">KPass</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Securely manage your passwords
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 items-center">
            <h2 className="font-semibold">Total Passwords</h2>
            <div className="flex items-center space-x-2 text-sm justify-self-end">
              <span className="font-semibold">
                {user?.passwords?.length ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button size="icon" variant="outline">
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        <DialogDemo />
      </div>
      <div className="col-span-2">
        <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="font-semibold">Website</div>
            <div className="font-semibold">Username</div>
            <div className="font-semibold text-right">Actions</div>
          </div>
          <div className="flex flex-col gap-0.5">
            {user?.passwords?.map(({ email, url }) => {
              return (
                <div className="grid grid-cols-3 items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{url}</span>
                  </div>
                  <div className="text-sm">{email}</div>
                  <div className="grid grid-rows-2 items-end justify-self-end gap-0.5">
                    <Button size="icon" variant="ghost">
                      <FileEditIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button size="icon" variant="ghost">
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function FileEditIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z" />
    </svg>
  )
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon">
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-800">
        <AddPassword />
      </DialogContent>
    </Dialog>
  )
}

const saveNewPassword = async (
  data: z.infer<typeof passwordSchema>,
  accessToken: string
) => {
  const res = await fetch(`${BASEURL}/passwords/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ACCESS_TOKEN: accessToken
    },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  return json
}

function AddPassword() {
  const [testData, setTestData] = useState("")
  const accessToken = userStore((state) => state.accessToken)

  const queryClient = useQueryClient()

  const { isPending, data, isError, mutateAsync } = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
    mutationKey: ["addPass"],
    mutationFn: ({
      data,
      accessToken
    }: {
      data: z.infer<typeof passwordSchema>
      accessToken: string
    }) => {
      return saveNewPassword(data, accessToken)
    }
  })

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    console.log(formData.entries())
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
      url: formData.get("url"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber")
    }

    try {
      const parsedUserCreditial = passwordSchema.parse(data)

      const result = await mutateAsync({
        data: parsedUserCreditial,
        accessToken
      })

      setTestData(JSON.stringify(parsedUserCreditial, null, 2))
    } catch (err) {
      console.error(err)
      if (err instanceof ZodError) {
        setTestData(JSON.stringify(err.errors[0], null, 2))
      }
      if (err instanceof Error) {
        setTestData(err.message)
      }
    }
  }

  return (
    <div className="w-11/12 mx-auto">
      <div>{testData}</div>
      <form onSubmit={handleFormSubmit} className="max-w-sm mx-auto">
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="email"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Your phoneNumber
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="+1234567890"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="site"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            site
          </label>
          <input
            type="text"
            id="site"
            name="url"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="username"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>

        <Button
          type="submit"
          className=" focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">
          Submit
        </Button>
      </form>
    </div>
  )
}