// import "../style.css"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import React, { useRef, type ElementRef } from "react"

import { storage } from "~popup"
import { getUserData } from "~tabs/home"
import type { User } from "~types"

import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

const queryClient = new QueryClient()

export function PopoverDemo() {
	const popOverTriggerRef = useRef<ElementRef<typeof PopoverTrigger>>(null)

	const {
		isPending,
		data: user,
		isError
	} = useQuery({
		queryKey: ["repoData"],
		queryFn: async () => getUserData((await storage.get("accessToken")) as string)
	})

	const passwords =
		!isPending && !isError
			? (user as User).passwords.filter(({ url }) => new URL(url).host == location.host)
			: []

	console.log(user)

	return (
		<Popover>
			{" "}
			<PopoverTrigger ref={popOverTriggerRef} asChild>
				<Button variant="outline">Open</Button>
			</PopoverTrigger>
			<PopoverContent className="min-w-80 w-full bg-gray-800">
				{isPending ? (
					<>
						<div className="text-white">please wait ....</div>
					</>
				) : (
					(user as User).passwords.map((pass) => {
						return (
							<div key={pass.id} className="text-white">
								<Button
									onClick={() => {
										popOverTriggerRef.current?.click()
									}}>
									{pass.email}
								</Button>
							</div>
						)
					})
				)}
			</PopoverContent>
		</Popover>
	)
}
export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<PopoverDemo />
		</QueryClientProvider>
	)
}
