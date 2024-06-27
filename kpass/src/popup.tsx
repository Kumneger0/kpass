import React, { useContext, useEffect, useRef, useState } from "react"

import logo from "../assets/icon.png"
import { loginSchema, signupSchema, storage } from "./utils"

import "./style.css"

import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQueryClient
} from "@tanstack/react-query"
import { z } from "zod"

import { createUser } from "~api/users"
import { Button } from "~components/button"
import { KapssContext, useKpassContext } from "~context"

const queryClient = new QueryClient()
const App = () => {
	const [isLogin, setIsLogin] = useState(false)
	const [baseURL, setBaseURL] = useState<string | null>("")
	const inputRef = useRef<HTMLInputElement>(null)
	const errorRef = useRef<HTMLSpanElement>(null)
	useEffect(() => {
		storage.get("base-url").then((baseURL) => setBaseURL(baseURL as string))
	}, [])

	if (!baseURL)
		return (
			<div className="flex min-w-96 flex-col items-center justify-center min-h-screen bg-gray-100 py-2">
				<div className="max-w-md w-full space-y-8">
					<div>
						<h1 className="text-4xl font-bold text-center text-gray-800">Enter Server URL</h1>
					</div>
					<div className="flex flex-col items-center">
						<input
							ref={inputRef}
							type="url"
							placeholder="Enter Server URL"
							className="w-full px-4 py-2 mt-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
							onInvalid={(e) => e.currentTarget.setCustomValidity("Please enter a valid URL")}
						/>
						<span
							ref={errorRef}
							className="text-red-600 text-xs mt-2 hidden"
							id="invalid-url-message"></span>
						<button
							onClick={async () => {
								const serverURL = inputRef.current?.value
								if (!serverURL) {
									errorRef.current?.classList.remove("hidden")
									return
								}
								try {
									await storage.set("base-url", serverURL)
									setBaseURL(serverURL)
									errorRef.current?.classList.add("hidden")
								} catch (err) {
									console.error(err)
								}
							}}
							className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out">
							Save
						</button>
					</div>
				</div>
			</div>
		)

	return (
		<KapssContext.Provider value={{ isLogin, setIsLogin, baseURL }}>
			<QueryClientProvider client={queryClient}>
				<div className="w-96 mx-auto">
					<h3 className="font-bold text-2xl my-2 p-3">KPass Privicy first password manager </h3>
					<IndexPopup />
					<footer className="font-bold text-center my-3 p-3 text-lg">Kpass 2024</footer>
				</div>
			</QueryClientProvider>
		</KapssContext.Provider>
	)
}

export default App
function IndexPopup() {
	const [accessToken, setAcessToken] = useState<string | null | undefined>("")
	const { isLogin, setIsLogin } = useKpassContext()
	useEffect(() => {
		storage.get("accessToken").then(setAcessToken)
	}, [isLogin])

	if (!!accessToken)
		return (
			<div key={accessToken} className="w-full max-w-sm p-4 bg-white">
				<div className="flex items-center justify-end mt-10">
					{" "}
					{accessToken && (
						<Button
							onClick={async () => {
								await storage.remove("accessToken")
								setIsLogin && setIsLogin(true)
							}}
							variant="destructive">
							Logout
						</Button>
					)}
				</div>
				<div className="flex items-center justify-center mt-10">
					<div>
						<a href="/tabs/home.html" target="_blank">
							<Button variant="link">Dashbord</Button>
						</a>
					</div>
					<div>
						<a target="_blank" href="/tabs/import.html">
							<Button variant="link">import/export passwords</Button>
						</a>
					</div>
				</div>
			</div>
		)
	if (isLogin) return <Login />
	return <SignUP />
}

function SignUP() {
	const formRef = React.useRef<HTMLFormElement>(null)
	const { isPending, mutateAsync, isError, error } = createUser()
	const { setIsLogin } = useKpassContext()
	const passwordRef = useRef<HTMLInputElement>(null)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		if (!formRef.current) return
		const formData = new FormData(formRef.current)
		const body = {
			email: formData.get("email"),
			masterPassword: formData.get("masterPassword")
		}

		try {
			const data = signupSchema.parse(body)
			const result = await mutateAsync(data)
			if (result?.status === "success") {
				setIsLogin && setIsLogin(true)
				return
			}
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(err.message)
			}
		}
	}

	if (isPending) {
		return <div>loading</div>
	}

	return (
		<section className="bg-gray-50 dark:bg-gray-900">
			{isError && <div className="my-3 p-3 text-lg text-red-600 border">{error.message}</div>}
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
				<a
					href="#"
					className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
					<img
						className="w-20 h-20 object-cover object-center rounded-[999999999px] mr-2"
						src={logo}
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
									type="password"
									ref={passwordRef}
									name="masterPassword"
									id="password"
									placeholder="password"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									required
								/>
								<button
									className="absolute inset-y-0 top-5 right-0 z-[9999] hover:cursor-pointer flex items-center pr-2 pointer-events-none"
									type="button"
									onClick={() => {
										const isPassword = passwordRef.current?.type == "password"
										passwordRef.current!.type = isPassword ? "text" : "password"
									}}>
									{passwordRef.current?.type == "password" ? <EyeOn /> : <EyeOff />}
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
									<label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">
										I accept the
										<a
											className="font-medium text-primary-600 hover:underline dark:text-primary-500"
											href="#">
											Terms and Conditions
										</a>
									</label>
								</div>
							</div>
							<button
								disabled={isPending}
								type="submit"
								className={`w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${isPending ? "opacity-50" : ""}`}>
								{isPending ? "..." : "Create an account"}
							</button>
							<p className="text-sm font-light text-gray-500 dark:text-gray-400">
								Already have an account?
								<Button
									onClick={() => setIsLogin && setIsLogin(true)}
									className="font-medium text-primary-600 hover:underline dark:text-primary-500">
									Login here
								</Button>
							</p>
						</form>
					</div>
				</div>
			</div>
		</section>
	)
}

function EyeOn() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			className="lucide lucide-eye">
			<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	)
}

function EyeOff() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			className="lucide lucide-eye-off">
			<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
			<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
			<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
			<line x1="2" x2="22" y1="2" y2="22" />
		</svg>
	)
}

async function LoginUser(user: Partial<z.infer<typeof signupSchema>>, BASEURL: string) {
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
			status: "success" as const,
			data: (await response.json()) as { accessToken: string }
		} as const
	return {
		status: "failed" as const,
		data: (await response.json()) as { message: string }
	} as const
}

function Login() {
	const formRef = React.useRef<HTMLFormElement>(null)
	const { setIsLogin, baseURL } = useContext(KapssContext)
	const queryClient = useQueryClient()
	const { isPending, mutateAsync, isError, error } = useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries()
		},
		mutationKey: ["login"],
		mutationFn: (data: Partial<z.infer<typeof signupSchema>>) => {
			return LoginUser(data, baseURL)
		}
	})

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		if (!formRef.current) return
		const formData = new FormData(formRef.current)
		const body = {
			email: formData.get("email"),
			masterPassword: formData.get("masterPassword")
		}
		try {
			const data = loginSchema.parse(body)
			const result = await mutateAsync(data)
			if (result?.status === "success") {
				await storage.set("accessToken", result.data.accessToken)
				setIsLogin && setIsLogin(false)
				return
			}
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(err.message)
			}
		}
	}

	if (isPending) return <div>loading...</div>

	return (
		<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
			{isError && <div className="my-3 p-3 text-lg text-red-600 border">{error.message}</div>}
			<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
				<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
					Login
				</h1>
				<form onSubmit={handleSubmit} ref={formRef} className="space-y-4 md:space-y-6">
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
						disabled={isPending}
						type="submit"
						className={`w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800  ${isPending ? "opacity-50" : ""}`}>
						{isPending ? "..." : "Login"}
					</button>
					<p className="text-sm font-light text-gray-500 dark:text-gray-400">
						new to kpass ?{" "}
						<Button
							onClick={() => setIsLogin && setIsLogin(false)}
							className="font-medium text-primary-600 hover:underline dark:text-primary-500">
							sign up here
						</Button>
					</p>
				</form>
			</div>
		</div>
	)
}
