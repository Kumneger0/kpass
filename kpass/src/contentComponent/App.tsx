import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import React, { useLayoutEffect, useRef, type ElementRef } from "react"

import type { User } from "~types"
import { getUserData, storage } from "~utils"

//@ts-ignore
import img from "../../assets/icon.png"
import { Button } from "../components/button"
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover"

const queryClient = new QueryClient()

const popoverContentStyle = {
	padding: "10px", // Add some padding for aesthetics
	backgroundColor: "#333", // Set a dark background color
	color: "#fff", // Set white text color for better contrast
	borderRadius: "4px", // Add rounded corners for a smooth look
	boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
	fontSize: "14px", // Set a comfortable font size
	minWidth: "300px",
	display: "flex",
	alignItems: "center",
	flexDirection: "column",
	maxHeight: "300px",
	overflowY: "scroll"
} satisfies React.CSSProperties
const kpassLogoStyles: React.CSSProperties = {
	padding: "10px",
	margin: "10px",
	borderRadius: "10px",
	width: "50px",
	height: "50px",
	objectFit: "cover",
	objectPosition: "center"
}
export function PopoverDemo({ onSelect }: { onSelect: (pass: User["passwords"][number]) => void }) {
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
			? (user as User)?.passwords?.filter(({ url }) => url == location.origin)
			: []

	return (
		<Popover>
			{" "}
			<PopoverTrigger ref={popOverTriggerRef} asChild>
				<img
					style={{ ...kpassLogoStyles, opacity: user === null ? "0.5" : "1" }}
					src={img}
					alt="kpass_logo"
				/>
			</PopoverTrigger>
			<PopoverContent style={popoverContentStyle}>
				{isPending ? (
					<>
						<div>please wait ....</div>{" "}
					</>
				) : (
					passwords?.map((pass) => {
						return (
							<div
								key={pass.id}
								style={{
									width: "100%",
									margin: "10px 0",
									gap: "5px",
									display: "flex",
									justifyContent: "space-around"
								}}>
								{" "}
								<Button
									onClick={() => {
										onSelect(pass satisfies User["passwords"][number])
										popOverTriggerRef.current?.click()
									}}
									style={{
										border: "none",
										width: "100%",
										padding: "10px",
										borderRadius: "10px",
										background: "lightgreen"
									}}>
									{pass.email}
									<span>
										<PencilIcon />
									</span>
								</Button>
							</div>
						)
					})
				)}
				{!passwords.length && <div>no saved passowrds available for this site</div>}
			</PopoverContent>
		</Popover>
	)
}
export default function App({
	elements,
	element
}: {
	elements: HTMLInputElement[]
	element: HTMLElement
}) {
	function onSelect(password: User["passwords"][number]) {
		for (const element of elements) {
			if (element.type == "password") {
				element.value = password.password
				return
			}
			if (element.type == "email") {
				element.value = password.email ?? password.phoneNumber
				return
			}
			element.value = password.email ?? password.phoneNumber
		}
	}
	const randomUniqueID = crypto.randomUUID()
	useLayoutEffect(() => {
		element?.setAttribute("list", randomUniqueID)
	}, [])

	return (
		<QueryClientProvider client={queryClient}>
			<PopoverDemo onSelect={onSelect} />
			<datalist id={randomUniqueID}>
				<option value="Chocolate"></option>
				<option value="Coconut"></option>
				<option value="Mint"></option>
				<option value="Strawberry"></option>
				<option value="Vanilla"></option>
			</datalist>
		</QueryClientProvider>
	)
}

function PencilIcon() {
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
			className="lucide lucide-pencil">
			<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
			<path d="m15 5 4 4" />
		</svg>
	)
}
