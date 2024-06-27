import { passwordSchema } from "~utils"

import { Button } from "../components/button"

import "../style.css"

import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQuery,
	useQueryClient
} from "@tanstack/react-query"
import React, { useRef, useState, type Dispatch, type SetStateAction } from "react"
import { z, ZodError } from "zod"

import type { AccessToken, Password, User } from "~types"
import { getUserData, storage } from "~utils"

import { Dialog, DialogContent, DialogTrigger } from "../components/dialog"
import { deletePassword, updatePassword, type UpdateParams } from "./savePassword"

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

function Component() {
	const [search, setSearch] = useState<string | null>(null)
	
	const {
		isPending,
		error,
		data: user
	} = useQuery({
		queryKey: ["repoData"],
		queryFn: async () => getUserData((await storage.get("accessToken")) as string)
	})

	if (isPending) return "Loading..."

	if (error) return "An error has occurred: " + error.message

	const filltedPassWords = search
		? user?.passwords.filter(({ url }) => url.toLowerCase().includes(search.toLowerCase()))
		: user?.passwords

	return (
		<div className="grid md:grid-cols-2 gap-4 items-start max-w-5xl mx-auto px-4">
			<div className="space-y-4">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">KPass</h1>
					<p className="text-gray-500 dark:text-gray-400">Securely manage your passwords</p>
				</div>
				<div>
					<Search search={search} setSearch={setSearch} />
				</div>
				<div className="space-y-4">
					<div className="grid grid-cols-2 items-center">
						<h2 className="font-semibold">Total Passwords</h2>
						<div className="flex items-center space-x-2 text-sm justify-self-end">
							<span className="font-semibold">{user?.passwords?.length ?? 0}</span>
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
					<div className="grid grid-cols-4 border-b border-gray-200 dark:border-gray-800 p-4">
						<div className="font-semibold">Website</div>
						<div className="font-semibold">Username / Email</div>
						<div className="font-semibold">Password</div>
						<div className="font-semibold text-right">Actions</div>
					</div>
					<div className="flex flex-col  gap-0.5">
						{filltedPassWords?.map(({ email, url, password, ID }) => {
							return <EachPassWord ID={ID} password={password} email={email} url={url} />
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

function Search({
	search,
	setSearch,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
	search: string | null
	setSearch: Dispatch<SetStateAction<string | null>>
}) {
	return (
		<div>
			<input
				className="py-4 px-2 border border-black m-2 rounded-xl "
				placeholder="Search Your Passwords"
				type="search"
				{...props}
				onChange={(e) => setSearch(e.currentTarget.value)}
			/>
		</div>
	)
}

function EachPassWord({
	email,
	url,
	password,
	phoneNumber = "",
	username = "",
	ID: id
}: Partial<z.infer<typeof passwordSchema> & { ID: string | undefined }>) {
	const [isEdit, setIsEdit] = useState(false)
	const formRef = useRef<HTMLFormElement>(null)

	const { data: accessToken, isPending } = useQuery({
		queryKey: ["token"],
		queryFn: async () => await storage.get("accessToken")
	})

	const queryClient = useQueryClient()

	const { mutate } = useMutation({
		mutationKey: ["updatePassword"],
		mutationFn: (arg: UpdateParams) => updatePassword(arg),
		onSuccess(_data, _variables, _context) {
			queryClient.invalidateQueries()
			setIsEdit(false)
		},
		onError(error, _variables, _context) {
			console.log(error)
			alert(error.message)
		}
	})
	const { mutate: deletePass, isPending: isUpdatePending } = useMutation({
		mutationKey: ["deletePassword"],
		mutationFn: (arg: Omit<UpdateParams, "body">) => deletePassword(arg),
		onSuccess(_data, _variables, _context) {
			queryClient.invalidateQueries()
			setIsEdit(false)
		},
		onError(error, variables, context) {
			console.log(error)
			alert(error.message)
		}
	})

	const handleEditPassword = (e: React.MouseEvent) => {
		e.preventDefault()
		if (!formRef.current) throw Error("formRef is undefined")
		const formData = new FormData(formRef.current)
		const passwordToUpate: Partial<z.infer<typeof passwordSchema>> = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			phoneNumber,
			url,
			username
		}

		try {
			const result = passwordSchema.parse(passwordToUpate)
			if (!accessToken) throw Error("Access token is missing")
			if (!id) throw Error("password is missing")
			mutate({ accessToken, body: result, id })
		} catch (err) {
			console.error(err)
		}
	}
	if (isPending) return <div>please wait </div>

	if (!accessToken) return <div>Access Token is Missing</div>
	if (!id) return <div>id is Missing</div>

	return (
		<form
			ref={formRef}
			className="grid grid-cols-4 items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
			<div className="font-medium">{url}</div>
			<div className="text-sm">
				<input
					name="email"
					className="py-3 px-1 border border-black outline-none rounded-xl"
					defaultValue={email}
					readOnly={!isEdit}
				/>
			</div>
			<ShowPassword isEdit password={password} />

			<div className="grid grid-rows-2 items-end justify-self-end gap-0.5">
				{isEdit ? (
					<button
						disabled={isUpdatePending}
						onClick={handleEditPassword}
						className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isUpdatePending ? "opacity-50 cursor-not-allowed" : ""}`}>
						{isUpdatePending ? "..." : "Done"}
					</button>
				) : (
					<>
						<button
							type="button"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={(e) => {
								e.preventDefault()
								setIsEdit(true)
							}}>
							Edit
						</button>
						<button
							onClick={(e) => {
								e.preventDefault()

								deletePass({ accessToken, id })
							}}
							type="button"
							className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
							Delete
						</button>
					</>
				)}
			</div>
		</form>
	)
}

function ShowPassword({ password, isEdit }: { password: string | undefined; isEdit: boolean }) {
	const [isShowPassword, setIsShowPassword] = useState(false)

	return (
		<div className="text-sm flex items-center gap-2">
			<div className="relative">
				<input
					type={isShowPassword ? "text" : "password"}
					name="password"
					className="py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					defaultValue={password}
					readOnly={!isEdit}
				/>
				<button
					type="button"
					className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
					onClick={() => setIsShowPassword((prev) => !prev)}>
					{isShowPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
				</button>
			</div>
		</div>
	)
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
			<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
			<path
				fillRule="evenodd"
				d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
			<path
				fillRule="evenodd"
				d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
				clipRule="evenodd"
			/>
			<path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
		</svg>
	)
}

function PlusIcon<T>(props: T) {
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

function SearchIcon<T>(props: T) {
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

export const saveNewPassword = async (
	data: Partial<z.infer<typeof passwordSchema>>,
	accessToken: AccessToken
) => {
	if (!accessToken) throw Error("Access Token is requied to save the passowrd")

	const BASEURL = await storage.get("base-url")

	if (!BASEURL) throw new Error("Failed to get server url")
	const res = await fetch(`${BASEURL}/passwords/new`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			ACCESS_TOKEN: accessToken
		},
		body: JSON.stringify(data)
	})
	const json = (await res.json()) as Password
	return json
}

function AddPassword() {
	const { data: accessToken, isPending: isTokenPending } = useQuery({
		queryKey: ["token"],
		queryFn: async () => await storage.get("accessToken")
	})

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
			accessToken: AccessToken
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

			if (!accessToken) throw Error("failed to save your password")

			const result = await mutateAsync({
				data: parsedUserCreditial,
				accessToken
			})
		} catch (err) {
			console.error(err)
			if (err instanceof ZodError) {
			}
			if (err instanceof Error) {
			}
		}
	}

	if (isTokenPending) return <div>please wait </div>

	return (
		<div className="w-11/12 mx-auto">
			<div>
				{data ? (
					<div>
						<div>url :{data.url}</div>
						<div>email : {data.email}</div>
						<div>password :{data.password}</div>
					</div>
				) : null}
			</div>
			<div className="font-bold text-2xl w-full text-center py-3 px-2">Add new password</div>
			<form onSubmit={handleFormSubmit} className="max-w-sm mx-auto">
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
						htmlFor="email"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
						email or username
					</label>
					<input
						type="email"
						name="email"
						id="email"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="email or username"
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

				<button
					disabled={isPending}
					type="submit"
					className={` focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${isPending ? "opacity-50 cursor cursor-not-allowed" : ""}`}>
					{isPending ? "please wait ..." : "Submit"}
				</button>
			</form>
		</div>
	)
}
