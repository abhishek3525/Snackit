import { useState } from "react"
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";

interface props{
    fetchMyRestaurant:()=>Promise<void>
}

const AddRestaurant = ({fetchMyRestaurant}:props) => {
    const [name,setName]=useState("");
    const [description,setDescription]=useState("");
    const [phone,setPhone]=useState("");
    const [image,setImage]=useState<File | null>(null);
    const [submitting,setSubmitting]=useState(false);

    const {loadingLocation,location}=useAppData();

    const handleSubmit=async()=>{
        if(!name || !image || !location){
            alert("All fields are required")
            return;
        }
        const formData=new FormData()

        formData.append("name",name);
        formData.append("description",description);
        formData.append("phone",phone);
        formData.append("file",image);
        formData.append("latitude",location.latitude.toString());
        formData.append("longitude",location.longitude.toString());
        formData.append("formattedAddress",location.formattedAddress);

        try {
            setSubmitting(true);
            await axios.post(`${restaurantService}/api/restaurant/new`,formData,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }
            })
            toast.success("Restaurant added successfully")
            await fetchMyRestaurant();
        } catch (error:any) {
            toast.error(error.response.data.message)
        }finally{
            setSubmitting(false);
        }
    }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-2">
            <h1 className="text-xl font-semibold">Add Restaurant</h1>
            
            <input type="text" placeholder="Restaurant name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-lg border border-gray-300 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-2" />
            <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full rounded-lg border border-gray-300 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-2" />
            <input type="text" placeholder="Contact Number" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-2" />

            <label  className="flex items-center gap-3 cursor-pointer rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50 transition-colors border-gray-300 mt-2"><BiUpload className="h-5 w-5 text-red-500"/>{image ? image.name : "Upload Restaurant Image"}
                <input type="file" accept="image/*" hidden onChange={(e)=>setImage(e.target.files?.[0] || null)} />
            </label>
            
            <div className="flex items-center gap-3 rounded-lg p-4 outline-none">
                <BiMapPin className="mt-0.5 h-5 w-5 text-red-500"/>
                <div className="text-sm">
                    {
                        loadingLocation? "Fetching your location...": location?.formattedAddress || "Location not available"
                    }
                </div>
            </div>
            
            <button className="w-full rounded-lg py-3 text-sm font-semibold text-white cursor-pointer bg-[#e23744] hover:bg-[#d93b3b] transition-colors" onClick={handleSubmit} disabled={submitting} >{submitting ? "Adding Restaurant..." : "Add Restaurant"} </button>
        </div>
    </div>
  )
}

export default AddRestaurant