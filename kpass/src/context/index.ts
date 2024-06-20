import { createContext, useContext } from "react"

export const KapssContext = createContext<{
	isLogin: boolean
	setIsLogin: React.Dispatch<React.SetStateAction<boolean>> | null
	baseURL: string
}>({ isLogin: false, setIsLogin: null, baseURL: "" })

export function useKpassContext() {
	return useContext(KapssContext)
}
