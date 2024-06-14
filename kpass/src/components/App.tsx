import React, { Fragment, useRef, useState, type ElementRef } from "react"

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
			<PopoverContent className="w-80">
				{fakeDemoPassWords.map((pass) => {
					return (
						<div key={pass}>
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
