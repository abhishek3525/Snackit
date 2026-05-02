import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../main"
import toast from "react-hot-toast"
import { useGoogleLogin } from "@react-oauth/google"
import {FcGoogle} from 'react-icons/fc'
import { useAppData } from "../context/AppContext"


const Login = () => {
    const [loading,setLoading]=useState(false)
    const navigate=useNavigate()

    const {setUser,setIsAuth}=useAppData()

    const responseGoogle=async(authResult:any)=>{
      setLoading(true);
      try {
        const result=await axios.post(`${authService}/api/auth/login`,{
          code:authResult['code']
        })

        localStorage.setItem("token",result.data.token)
        toast.success(result.data.message)
        setLoading(false)
        setUser(result.data.user)
        setIsAuth(true)
        navigate("/")
      } catch (error) {
        console.log(error)
        setLoading(false)
        toast.error("Problem while login")
      }
    }
    const googleLogin=useGoogleLogin({
      onSuccess:responseGoogle,
      onError:responseGoogle,
      flow:'auth-code'
    })
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6 ">
        <h1 className="text-center text-3xl font-bold text-[#f6de06]">SNACKIT</h1>
        <p className="text-center text-sm text-gray-500">Login or Sign up to continue</p>
        <button onClick={googleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><FcGoogle size={20}/> {loading ? "Signing in..." : "Continue with Google"} </button>

        <p className="text-center text-xs text-gray-400">By continuing, you agree with our <span className="text-[#E23774]">Terms of Service</span> and <span className="text-[#E23774]">Privacy Policy</span></p>
      </div>
    </div>
  )
}

export default Login