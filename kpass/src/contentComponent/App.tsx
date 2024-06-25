import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import React, { useRef, type ElementRef } from "react"

import type { User } from "~types"
import { storage } from "~utils"

//@ts-ignore
import img from "../../assets/icon.png"
import { Button } from "../components/button"
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover"

const queryClient = new QueryClient()
export const getUserData = async (accessToken: string | null) => {
	const BASEURL = await storage.get("base-url")
	if (!BASEURL) throw new Error("Failed to get server url")
	const url = `${BASEURL}/passwords`

	if (!accessToken) throw Error("please specify access token")
	const response = await fetch(url, {
		headers: {
			ACCESS_TOKEN: accessToken
		}
	})
	const data = (await response?.json()) as User
	return data
}
const popOverContentStyle: React.CSSProperties = {
	minWidth: "240px",
	minHeight: "200px",
	border: "none",
	background: "white",
	borderRadius: "10px",
	backgroundColor: "gray"
}
const kpassLogoStyles: React.CSSProperties = {
	padding: "10px",
	margin: "10px",
	borderRadius: "10px",
	width: "50px",
	height: "50px",
	objectFit: "cover",
	objectPosition: "center"
}
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
			? (user as User)?.passwords.filter(({ url }) => new URL(url).origin == location.origin)
			: []
	return (
		<Popover>
			{" "}
			<PopoverTrigger ref={popOverTriggerRef} asChild>
				<img style={kpassLogoStyles} src={img} alt="kpass_logo" />
			</PopoverTrigger>
			<PopoverContent style={popOverContentStyle}>
				{isPending ? (
					<>
						<div style={{ color: "white" }}>please wait ....</div>
					</>
				) : (
					(user as User)?.passwords?.map((pass) => {
						return (
							<div key={pass.id} style={{ color: "white" }}>
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
