import "../style.css"

import React, { Fragment, useRef, type ElementRef } from "react"

import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

const fakeDemoPassWords = ["hellow", "hellow ", "alsoe another one", "here alose"]
export function PopoverDemo() {
	const popOverTriggerRef = useRef<ElementRef<typeof PopoverTrigger>>(null)
	return (
		<Popover>
			<PopoverTrigger ref={popOverTriggerRef} asChild>
				<Button variant="outline">Open popover</Button>
			</PopoverTrigger>
			<PopoverContent className="min-w-80 w-full bg-gray-800">
				{fakeDemoPassWords.map((pass) => {
					return (
						<div key={pass} className="text-white">
							<Button
								onClick={() => {
									popOverTriggerRef.current?.click()
								}}>
								{pass}
							</Button>
						</div>
					)
				})}
			</PopoverContent>
		</Popover>
	)
}
export default function App() {
	return (
		<Fragment>
			<PopoverDemo />
		</Fragment>
	)
}
