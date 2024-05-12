import Papa from "papaparse"
import React, { useRef, useState } from "react"

import { Button } from "../components/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select"

function Import() {
	const readCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files
		if (!files?.length) return
		Papa.parse(files[0], {
			complete: function (results) {
				console.log(results)
			}
		})
	}

	return (
		<div className="">
			<div>Read passwords from csv file</div>
			<div>
				<input
					onChange={readCSV}
					type="file"
					className="p-3 rounded-lg"
					accept="text/csv"
					multiple={false}
				/>
			</div>
		</div>
	)
}

// export default Import

type Managers = Readonly<"google-chrome" | "dashlane" | "1password" | "lastpass">
type Steps = {
	[key in Managers]: string[]
}

const steps: Steps = {
	"google-chrome": [
		"1. Open Google Chrome and go to chrome://settings/passwords",
		"2. Click the 3-dot menu and select 'Export passwords'",
		"3. Save the exported CSV file"
	],
	dashlane: [
		"1. Open Dashlane and go to Settings",
		"2. Click 'Export Data'",
		"3. Select 'Passwords' and choose 'CSV' format",
		"4. Save the exported CSV file"
	],
	"1password": [
		"1. Open 1Password and go to Settings",
		"2. Click 'Export Data'",
		"3. Select 'Passwords' and choose 'CSV' format",
		"4. Save the exported CSV file"
	],
	lastpass: [
		"1. Open LastPass and go to Settings",
		"2. Click 'Export'",
		"3. Select 'Passwords' and choose 'CSV' format",
		"4. Save the exported CSV file"
	]
}

export default function ImportPasswords() {
	const [selectedPasswordManager, setSelectedPasswordManager] = useState<Managers>("google-chrome")
	const selectedStep = steps[selectedPasswordManager]

	return (
		<div className="mx-auto max-w-md space-y-6 py-12">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Import Passwords</h1>
				<p className="text-gray-500 dark:text-gray-400">
					To import your passwords, export them as a CSV file from your current password manager and
					upload it here.
				</p>
			</div>
			<div className="space-y-4">
				<Select
					onValueChange={(e) => setSelectedPasswordManager(e as Managers)}
					defaultValue={selectedPasswordManager}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select password manager" />
					</SelectTrigger>
					<SelectContent className="bg-white">
						<SelectItem value="google-chrome">Google Chrome</SelectItem>
						<SelectItem value="dashlane">Dashlane</SelectItem>
						<SelectItem value="1password">1Password</SelectItem>
						<SelectItem value="lastpass">LastPass</SelectItem>
					</SelectContent>
				</Select>
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>{selectedPasswordManager}</CardTitle>
						</CardHeader>
						<CardContent>
							{selectedStep?.map((step) => {
								return <div key={step}>{step}</div>
							})}
						</CardContent>
					</Card>

					<Button className="w-full">Import</Button>
				</div>
			</div>
		</div>
	)
}
