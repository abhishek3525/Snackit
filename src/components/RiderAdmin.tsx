import axios from 'axios';
import { adminService } from '../main';
import toast from 'react-hot-toast';

const RiderAdmin = ({rider,onVerify}:{rider:any,onVerify:()=>void}) => {
    const verify=async()=>{
        try {
            await axios.patch(`${adminService}/api/v1/verify/rider/${rider._id}`,{},{
                headers:{
                    "authorization":`Bearer ${localStorage.getItem("token")}`,
                }
            });
            toast.success("Rider verified")
            onVerify();
        } catch (error:any) {
            toast.error(error.response.data.message)
        }
    }
  return (
    <div className="rounded-xl bg-white p-4 shadow space-y-2">
        <img className="w-full h-40 object-cover rounded" src={rider.picture} alt={rider.name} />
        <p className="text-sm text-gray-500 ">Phone: {rider.phone}</p>
        <p className="text-sm text-gray-500 ">Aadhar Number: {rider.aadharNumber}</p>
        <p className="text-sm text-gray-500 ">Dl Number: {rider.drivingLicenceNumber}</p>

        <button onClick={verify} className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600 cursor-pointer">Verify Rider</button>
    </div>
  )
}

export default RiderAdmin