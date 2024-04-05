import React, { useEffect, useState } from "react"

import { storage } from "./popup"

import "./style.css"

import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import { date, type TypeOf, type z } from "zod"

import { Button } from "~components/button"

import { getUserData, saveNewPassword } from "./tabs/home"
import { passwordSchema, userStore, type User } from "./utils"

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

type UpdateParams = {
	accessToken: string
	id: string | number
	body: z.infer<typeof passwordSchema>
}
const updatePassword = async ({ accessToken, id, body }: UpdateParams) => {
	if (!id) throw Error("id is required to update")
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

function IndexOptions() {
	const accessToken = userStore((state) => state.accessToken)

	const {
		isPending,
		isError,
		data: user
	} = useQuery({
		queryKey: ["repoData"],
		queryFn: () => getUserData(accessToken)
	})

	const {
		data: credential,
		isPending: isCredeitialPending,
		isError: isCredeitialError
	} = useQuery({
		queryKey: ["getCredetialToSave"],
		queryFn: async () =>
			(await storage.get("credential")) as Awaited<
				ReturnType<typeof getUserData>
			>["passwords"][number]
	})

	const {
		data,
		isPending: isUpdatePending,
		isError: isUpdateError,
		error,
		mutate
	} = useMutation({
		mutationKey: ["updatePassword"],
		mutationFn: (arg: UpdateParams) => updatePassword(arg)
	})

	console.log("update error", error)

	if (isPending || isCredeitialPending) return <div>please wait</div>
	if (isError || isCredeitialError) return <div>there was an error occured</div>

	const previousPassword = user.passwords.find(
		({ url }) => url.toLowerCase().trim() == credential?.url?.toLowerCase()?.trim()
	)

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<h1 className="text-2xl font-bold mb-4">
				{previousPassword ? (
					<div>do you want to update the password for {credential?.url}</div>
				) : (
					<div>Do you want to save your new password?</div>
				)}
			</h1>
			<div className="w-full max-w-md p-4 bg-white shadow-md rounded-md">
				{Object.keys(credential)?.map((key) => (
					<div
						key={key}
						className="flex justify-between items-center border-b border-gray-200 py-2">
						<div>{key}</div>
						<div>{credential[key]}</div>
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
							try {
								const result = await saveNewPassword(credential, accessToken)
								console.log(result)
							} catch (err) {
								console.error(err)
							}
						}}
						variant="default"
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
						save as new
					</Button>
				</div>
				<div>
					{!!previousPassword && (
						<Button
							onClick={async () => {
								if (previousPassword) {
									mutate({
										id: (previousPassword as unknown as Record<string, string>).ID,
										accessToken: accessToken,
										body: credential
									})
									return
								}
							}}
							className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
							update
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
