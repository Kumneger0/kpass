import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import React, { useRef, useState } from "react"
import { type z } from "zod"

import { Button } from "~components/button"
import type { AccessToken, Password, User } from "~types"

import { saveNewPassword } from "../tabs/home"
import { getUserData, passwordSchema, storage } from "../utils"

const queryClient = new QueryClient()
const BASEURL = "http://localhost:8080"
const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<IndexOptions />
		</QueryClientProvider>
	)
}
export default App
export type UpdateParams = {
	accessToken: AccessToken
	id: string | number
	body: z.infer<typeof passwordSchema>
}
export const updatePassword = async ({ accessToken, id, body }: UpdateParams) => {
	if (!id || !accessToken) throw Error("id is required to update")
	const url = `${BASEURL}/passwords/update/${id}`

	const response = await fetch(url, {
		method: "put",
		headers: {
			ACCESS_TOKEN: accessToken
		},
		body: JSON.stringify(body)
	})
	const data = (await response?.json()) as User
	return data
}
async function onMutaionSuccess() {
	window.close()
	await storage.remove("credential")
}
export const deletePassword = async ({ accessToken, id }: Omit<UpdateParams, "body">) => {
	if (!id || !accessToken) throw Error("id is required to delete")
	const url = `${BASEURL}/passwords/delete/${id}`
	const response = await fetch(url, {
		method: "delete",
		headers: {
			ACCESS_TOKEN: accessToken
		}
	})
	const data = (await response?.json()) as User
	console.log(data)
	return data
}

function getFormData(
	formRef: React.RefObject<HTMLFormElement>,
	credential: User["passwords"][number]
) {
	const formdata = new FormData(formRef.current!)
	const passToSave: Partial<User["passwords"][number]> = {}
	Object.keys(credential).forEach((key) => {
		const k = key as keyof User["passwords"][number]
		//@ts-expect-error
		passToSave[k] = formdata.get(k)
	})
	return passToSave
}

function IndexOptions() {
	const { data: accessToken, isPending: isTokenPending } = useQuery({
		queryKey: ["token"],
		queryFn: async () => await storage.get("accessToken")
	})
	const formRef = useRef<HTMLFormElement>(null)
	const [selectedId, setSelectedId] = useState<string | number | null | undefined>(null)
	const {
		isPending,
		isError,
		error,
		data: user
	} = useQuery({
		queryKey: ["repoData"],
		queryFn: () => getUserData(accessToken!)
	})

	const {
		data: credential,
		isPending: isCredeitialPending,
		isError: isCredeitialError
	} = useQuery({
		queryKey: ["getCredetialToSave"],
		queryFn: async () => (await storage.get("credential")) as NonNullable<User["passwords"][number]>
	})

	const { mutate } = useMutation({
		mutationKey: ["updatePassword"],
		mutationFn: (arg: UpdateParams) => {
			const passToSave = getFormData(formRef!, credential as Password)
			arg.body = passToSave as Password
			return updatePassword(arg)
		},
		onSuccess: onMutaionSuccess,
		onError: console.error
	})
	const { mutateAsync } = useMutation({
		mutationKey: ["savePassword"],
		mutationFn: () => {
			const passToSave = getFormData(formRef!, credential as Password)
			return saveNewPassword(passToSave as Password, accessToken as string)
		},
		onSuccess: onMutaionSuccess,
		onError: console.error
	})

	if (isTokenPending) return <div>please wait</div>
	if (!accessToken) return <div>login to start saving your passwords</div>

	if (isPending || isCredeitialPending) return <div>please wait</div>
	if (isError || isCredeitialError)
		return <div>{error?.message ?? "there was an error occured"}</div>

	const previousPassword = (user as User)?.passwords?.filter(
		({ url }) => url.toLowerCase().trim() == credential?.url?.toLowerCase()?.trim()
	)

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<h1 className="text-2xl font-bold mb-4">
				{!previousPassword?.length && <div>Do you want to save your new password?</div>}
			</h1>

			<div className="p-4">
				<h1 className="text-xl font-bold mb-4">
					{!!previousPassword?.length && <span>Your other passwords on {credential.url}</span>}
				</h1>
				{previousPassword?.map(({ email, ID, password }) => {
					return (
						<div className="flex justify-center items-center mb-4">
							<div className="flex justify-between items-center border-b border-gray-200 py-2 w-full">
								<div className="text-gray-600">Email</div>
								<div className="text-gray-800">{email}</div>
								<div className="text-gray-600">Password</div>
								<div className="text-gray-800">{password}</div>
							</div>
							<div className="ml-4">
								<Button
									className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
									onClick={() => setSelectedId(ID)}>
									{selectedId == ID ? "Selected" : "Select"}
								</Button>
							</div>
						</div>
					)
				})}
			</div>
			<form ref={formRef}>
				<div className="w-full max-w-md p-4 bg-white shadow-md rounded-md">
					<div>{!!previousPassword?.length && <span>Your Current password</span>}</div>
					{Object.keys(credential)?.map((key) => (
						<div key={key} className="flex flex-col items-center border-b border-gray-200 py-2">
							<div className="font-semibold text-sm mb-1">{key}</div>
							<div className="w-full">
								<input
									required
									name={key}
									defaultValue={credential[key as keyof typeof credential]}
									type={key.toLowerCase() === "password" ? "password" : "text"}
									className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
								/>
							</div>
						</div>
					))}
				</div>
				<div className="flex justify-center mt-4">
					<div className="mr-2">
						<Button
							variant="destructive"
							className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
							Cancel
						</Button>
					</div>
					<div className="mr-2">
						<Button
							onClick={async () => {
								await mutateAsync({})
								window.close()
								await storage.remove("credential")
							}}
							variant="default"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
							save as new
						</Button>
					</div>
					<div>
						{!!previousPassword && (
							<button
								disabled={!selectedId}
								onClick={async () => {
									if (selectedId) {
										mutate({
											id: selectedId,
											accessToken: accessToken!,
											body: credential
										})
										window.close()
                    await storage.remove("credential")
									}
								}}
								className={`bg-green-500 p-2  text-white font-bold py-2 px-4 rounded ${!selectedId ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}>
								update
							</button>
						)}
					</div>
				</div>
			</form>
		</div>
	)
}
