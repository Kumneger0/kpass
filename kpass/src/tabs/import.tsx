import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable
} from "@tanstack/react-table"
import Papa from "papaparse"
import React, { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select"
import { type Password } from "../utils"

function Import({ onCSVInput }: { onCSVInput: (passwords: Papa.ParseResult<unknown>) => void }) {
	const readCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files
		if (!files?.length) return
		Papa.parse(files[0], {
			complete: onCSVInput
		})
	}

	return (
		<div className="">
			<div>Select your CSV file</div>
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

type ArrayOfPasswords = Array<Omit<Password, "ID">>

function covertArrayToArrayOfPasswords(
	array: Papa.ParseResult<unknown>,
	passwordManager: Managers
): ArrayOfPasswords {
	let passwords: ArrayOfPasswords = []
	const headers = array.data[0] as string[]
	console.log("headers ", headers)
	if (passwordManager == "google-chrome") {
		passwords = (array.data as Array<string[]>).map((row, i) => {
			const singleRow: Omit<Password, "ID"> = {}
			row.forEach((p, i) => {
				if (headers[i] == "url") {
					singleRow.url = p
				} else if (headers[i] == "username") {
					singleRow.email = p
				} else if (headers[i] == "password") {
					singleRow.password = p
				}
			})
			singleRow.id = i
			return singleRow
		})
	}
	return passwords
}

export default function ImportPasswords() {
	const [selectedPasswordManager, setSelectedPasswordManager] = useState<Managers>("google-chrome")
	const [passwords, setPassswords] = useState<ArrayOfPasswords>([])
	const selectedStep = steps[selectedPasswordManager]

	const onCSVInput = (passwords: Papa.ParseResult<unknown>) => {
		const arrofPass = covertArrayToArrayOfPasswords(passwords, selectedPasswordManager)
		setPassswords(arrofPass)
	}

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
					<Import onCSVInput={onCSVInput} />
				</div>
			</div>
			<App passwords={passwords} />
		</div>
	)
}

const columnHelper = createColumnHelper<Password>()

const columns = [
	columnHelper.accessor("url", {
		cell: (info) => info.getValue(),
		footer: (info) => info.column.id
	}),
	columnHelper.accessor((row) => row.email, {
		id: "lastName",
		cell: (info) => <i>{info.getValue()}</i>,
		header: () => <span>email | username</span>,
		footer: (info) => info.column.id
	}),
	columnHelper.accessor("password", {
		header: () => "password",
		cell: (info) => info.renderValue(),
		footer: (info) => info.column.id
	})
]

function App({ passwords }: { passwords: ArrayOfPasswords }) {
	const [data, _setData] = React.useState(passwords)
	const rerender = React.useReducer(() => ({}), {})[1]

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel()
	})

	return (
		<div className="p-2">
			<table>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					{table.getFooterGroups().map((footerGroup) => (
						<tr key={footerGroup.id}>
							{footerGroup.headers.map((header) => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.footer, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</tfoot>
			</table>
			<div className="h-4" />
			<button onClick={() => rerender()} className="border p-2">
				Rerender
			</button>
		</div>
	)
}
