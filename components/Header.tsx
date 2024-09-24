'use client'
import { useState,useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import CustomButton from "./ui/CustomButton"
import {Menu,Coins,Leaf,Search,Bell,User,LogIn,LogOut,ChevronDown} from "lucide-react"
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"
import {Web3Auth} from "@web3auth/modal"
import { CHAIN_NAMESPACES,IProvider,WEB3AUTH_NETWORK } from "@web3auth/base"
import {EthereumPrivateKeyProvider} from "@web3auth/ethereum-provider"
import { createUser, getUserByEmail,getUnreadNotification ,getUserBalance,markNotificationRead} from "@/utils/db/actions"

const clientId = process.env.WEB3_AUTH_CLIENT_ID
const chainConfig = {
    chainNamespace:CHAIN_NAMESPACES.EIP155,
    chainId:'0xaa36a7',
    rpcTarget:'https://rpc.ankr.com/eth_sepolia',
    displayName:'Sepolia Testnet',
    blockExplorerUrl:'https://sepolia.etherscan.io',
    ticker:'ETH',
    tickerName:'Ethereum',
    logo:'https://assets.web3auth.io/evm-chains/sepolia.png',

}
const privateKeyProvider = new EthereumPrivateKeyProvider({
    config:chainConfig,
})
const web3Auth = new Web3Auth({
    clientId,
    web3AuthNetwork:WEB3AUTH_NETWORK.TESTNET,
    privateKeyProvider,
})

interface HeaderProps{
    onMenuClick:()=>void;
    totalEarnings:number;
}
export default function Header({onMenuClick,totalEarnings}:HeaderProps){
    const [provider,setProvider] = useState<IProvider| null>(null)
    const [loggedIn,setLoggedIn] = useState(false)
    const [loading,setLoading] = useState(false)
    const [userInfo,setUserInfo] = useState<any>(null)
    const pathname = usePathname()
    const [notification,setNotification] = useState<Notification[]>([])
    const [balance,setBalance] = useState<number>(0)

    useEffect(()=>{
        const init = async ()=>{
            try {
                setProvider(web3Auth.provider)
            if(web3Auth.connected){
                setLoggedIn(true)
                const user = await web3Auth.getUserInfo();
                setUserInfo(user)

                if(user.email){
                    localStorage.setItem('userEmail',user.email)
                    try {
                        await createUser(user.email,user.name||"Anonymous user")
                    } catch (error) {
                        console.error('Error creating user', error)
                    }
                    
                    
                }
            }
            } catch (error) {
                console.error('Error intialization Web3auth', error)
            }
            finally{
                setLoading(false)
            }     
         }
         init()
    },[])

    useEffect(()=>{
        const fetchNotification = async()=>{
            if(userInfo && userInfo.email){
                const user = await getUserByEmail(userInfo.email)
                if(user){
                    const unreadNotification = await getUnreadNotification(user.id)
                }
            }
        }
        fetchNotification();
        const notificationInterval = setInterval(fetchNotification,30000);
        return ()=>clearInterval(notificationInterval)
    },[])

    useEffect(()=>{
        const fetchUserBalance = async(){
            if(userInfo && userInfo.email){
                const user = await getUserByEmail(userInfo.email)
                if(user){
                    const userBalance = await getUserBalance(user.id)
                    setBalance(userBalance)
                }
            }
        }
        fetchUserBalance();
        const handleBalanceUpdate = (event:CustomEvent)=>{
            setBalance(event.detail)
        }
        window.addEventListener('balanceUpdate',handleBalanceUpdate as EventListener)
        return ()=>{
            window.removeEventListener('balanceUpdate',handleBalanceUpdate as EventListener)
        }
    },[userInfo ])
    const login = async()=>{
        if(!web3Auth){
            console.error("web3auth not intialized")
            return
        }
        try {
            const web3authProvider = await web3Auth.connect();
            setProvider(web3authProvider)
            setLoggedIn(true)
            const user = await web3Auth.getUserInfo()
            setUserInfo(user)
            if(user.email){
                localStorage.setItem('userEmail',user.email)
                try {
                    await createUser(user.email,user.name||'Anonymous name')
                } catch (error) {
                    console.error('error creating user ',error)
            return
                }
            }
        } catch (error) {
            console.error('error logging in ',error)
            return
        }
    }
    const logout = async()=>{
        if(!web3Auth){
            console.error("web3auth not intialized")
            return
        }
        try {
            await web3Auth.logout()
            setProvider(null)
            setLoggedIn(false)
            setUserInfo(null)
            localStorage.removeItem('userEmail')
        } catch (error) {
            console.error('error logging out ',error)
            return
        }
    }
    const getUserInfo = async()=>{
        if(web3Auth.connected){
            const user = await web3Auth.getUserInfo();
            setUserInfo(user)
            if(user.email){
                localStorage.setItem('userEmail',user.email)
                try {
                    await createUser(user.email,user.name ||'Anonymous name')
                } catch (error) {
                    console.error('Error creating user', error)
                }
            }
        }
    }

    const handleNotificationClick = async(notificationId:number)=>{
        await markNotificationRead(notificationId);
    }
    if(loading){
        return <div>Loading web3 auth ....</div>
    }
    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-500">
            <div className="flex items-center justify-between px-4 py-">
                <div>
                    
                </div>
            </div>
        </header>
    )
}
