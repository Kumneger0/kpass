import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
	type Cell
} from "@tanstack/react-table"
import Papa from "papaparse"
import React, { useState } from "react"

import { Button } from "~components/button"
import { isInKey } from "~contents/content"
import { storage } from "~popup"

import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select"
import { type Password } from "../utils"
import { saveNewPassword } from "./home"

const queryClient = new QueryClient()

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

type ArrayOfPasswords = Array<Partial<Omit<Password & { username: string }, "ID">>>

function covertArrayToArrayOfPasswords(
	array: Papa.ParseResult<unknown>,
	passwordManager: Managers
): ArrayOfPasswords {
	let passwords: ArrayOfPasswords = []
	const headers = array.data[0] as string[]
	if (passwordManager == "google-chrome") {
		passwords = (array.data as Array<string[]>).map((row, i) => {
			const singleRow: Partial<ArrayOfPasswords[number]> = {}
			row.forEach((p, i) => {
				const key = headers[i]
				if (!["url", "username", "password"].includes(key)) return
				console.log(isInKey(singleRow, key))
				//@ts-ignore
				singleRow[key] = p
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
		console.log(arrofPass)
		setPassswords(arrofPass)
	}

	return (
		<>
			<QueryClientProvider client={queryClient}>
				<div className="mx-auto max-w-md space-y-6 py-12">
					<div className="space-y-2 text-center">
						<h1 className="text-3xl font-bold">Import Passwords</h1>
						<p className="text-gray-500 dark:text-gray-400">
							To import your passwords, export them as a CSV file from your current password manager
							and upload it here.
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
				</div>
				{passwords.length && <App passwords={passwords} />}
			</QueryClientProvider>
		</>
	)
}

const columnHelper = createColumnHelper<Password & { username: string; host: string | null }>()

const columns = [
	columnHelper.accessor("host", {
		cell: (info) => info.getValue(),
		footer: (info) => info.column.id
	}),
	columnHelper.accessor("username", {
		header: () => "username",
		cell: (info) => info.renderValue(),
		footer: (info) => info.column.id
	}),
	columnHelper.accessor("password", {
		header: () => "password",
		cell: (info) => info.renderValue(),
		footer: (info) => info.column.id
	})
]

const savePasswords = async (
	{ passwords }: { passwords: ArrayOfPasswords },
	accessToken: string
) => {
	const result = await Promise.allSettled(
		passwords?.map(({ username, password, url }) =>
			saveNewPassword({ email: username, password, url, username }, accessToken)
		)
	)
	return {
		successResult: result.filter(
			(r) => r.status === "fulfilled"
		) as PromiseFulfilledResult<Password>[],
		failedResult: result.filter((r) => r.status === "rejected") as PromiseRejectedResult[]
	}
}

function App({ passwords }: { passwords: ArrayOfPasswords }) {
	const { data: accessToken, isPending: isTokenPending } = useQuery({
		queryKey: ["token"],
		queryFn: async () => await storage.get("accessToken")
	})

	const { isPending, isError, mutateAsync, data } = useMutation({
		mutationKey: ["uploadPasswords"],
		mutationFn: ({
			passwords,
			accessToken
		}: {
			passwords: ArrayOfPasswords
			accessToken: string
		}) => savePasswords({ passwords }, accessToken),
		onSuccess: () => {
			alert("done")
		}
	})

	const table = useReactTable({
		data: passwords
			.map((p) => ({
				...p,
				username: p.username || "",
				host: (() => {
					try {
						return new URL(p.url || "").host || null
					} catch (err) {
						console.log(err)
						return p.url || null
					}
				})()
			}))
			.filter((p): p is Password & { username: string; host: string | null } => p.id !== undefined),
		columns,
		getCoreRowModel: getCoreRowModel()
	})

	if (isPending) return <div>loading</div>

	if (data) {
		return (
			<div>
				<div>success Result</div>
				<div>
					{data.successResult.map(({ value }) => (
						<div>
							<div>{value.url}</div>
							<div>{value.email}</div>
						</div>
					))}
				</div>
				<div>
					<div>faliled result </div>
					<div>{data.failedResult.length} passwords aren't saved</div>
				</div>
			</div>
		)
	}

	return (
		<div className="p-2 max-w-5xl mx-auto">
			<div className="overflow-x-auto shadow-md sm:rounded-lg">
				<table className="w-full whitespace-no-wrap">
					<thead className="bg-gray-50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-gray-200">
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<RenderCell cell={cell} />
								))}
							</tr>
						))}
					</tbody>
					<tfoot>
						{table.getFooterGroups().map((footerGroup) => (
							<tr key={footerGroup.id}>
								{footerGroup.headers.map((header) => (
									<th key={header.id} className="px-6 py-3">
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.footer, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</tfoot>
				</table>
			</div>
			<div className="h-4" />
			<Button
				onClick={() => {
					if (!accessToken) throw Error("accessToken is missing")
					mutateAsync({ passwords, accessToken })
				}}
				className="border p-2">
				save
			</Button>
		</div>
	)
}

function RenderCell({
	cell
}: {
	cell: Cell<Password & { username: string; host: string | null }, unknown>
}) {
	const [isShowPassWord, setShowPassword] = useState(false)
	const isPassword = cell.column.id === "password"

	if (!isPassword)
		return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>

	return (
		<td key={cell.id}>
			<div className="w-full flex justify-center items-center gap-3">
				{!isShowPassWord ? (
					<div>
						<div>"*******"</div>
					</div>
				) : (
					flexRender(cell.column.columnDef.cell, cell.getContext())
				)}
				<div>
					<Button onClick={() => setShowPassword((prv) => !prv)}>show</Button>
				</div>
			</div>
		</td>
	)
}
