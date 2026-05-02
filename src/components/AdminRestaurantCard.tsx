import axios from "axios"
import { adminService } from "../main"
import toast from "react-hot-toast";


const AdminRestaurantCard = ({restaurant,onVerify}:{restaurant:any,onVerify:()=>void}) => {
    const verify=async()=>{
        try {
            await axios.patch(`${adminService}/api/v1/verify/restaurant/${restaurant._id}`,{},{
                headers:{
                    "authorization":`Bearer ${localStorage.getItem("token")}`,
                }
            });
            toast.success("Restaurant verified")
            onVerify();
        } catch (error:any) {
            toast.error(error.response.data.message)
        }
    }
    
  return (
    <div className="rounded-xl bg-white p-4 shadow space-y-2">
        <img className="w-full h-40 object-cover rounded" src={restaurant.image} alt={restaurant.name} />
        <h3 className="text-xl font-semibold">{restaurant.name}</h3>
        <p className="text-sm text-gray-500 ">{restaurant.phone}</p>
        <p className="">{restaurant.autoLocation.formattedAddress}</p>

        <button onClick={verify} className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600 cursor-pointer">Verify Restaurant</button>
    </div>
  )
}

export default AdminRestaurantCard