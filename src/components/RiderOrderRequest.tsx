import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface props{
    orderId:string;
    onAccepted:()=>void
}

const RiderOrderRequest = ({orderId,onAccepted}:props) => {
    const [accepting,setAccepting]=useState(false)
    const [secondsLeft,setSecondsLeft]=useState(10)

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onAccepted();
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);
        return () => clearInterval(interval);
    }, [onAccepted])

    const acceptOder=async()=>{
        try {
            await axios.post(`${riderService}/api/rider/accept/${orderId}`,{},{
                headers:{
                    "Authorization":`Bearer ${localStorage.getItem("token")}`
                }
            })
            toast.success("Oder Accepted");
            onAccepted();
        } catch (error:any) {
            toast.error(error.response.data.message);
        }finally{
            setAccepting(false);
        }
    }
  return (
    <div className="rounded-xl bg-white p-4 shandow-sm border border-green-300 space-y-3">
        <p className="text-center text-xs font-semibold text-red-600 ">Accept within {secondsLeft}</p>
        <p className="text-center text-xs text-green-600 ">New Delivery Request</p>
        
        <p className="text-xs text-gray-600 ">Order ID:<b> {orderId.slice(-6)}</b></p>

        <button className="w-full rounded-lg bg-green-600 text-white text-sm py-2 font-semibold hover:bg-green-700 disabled:bg-gray-400
        cursor-pointer " disabled={accepting} onClick={acceptOder}> {accepting? "Accepting...":"Accept Order"}</button>
    </div>
  )
}

export default RiderOrderRequest