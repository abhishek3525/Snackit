import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext"
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";


const Home = () => {
  const {location}=useAppData();
  const [searchParams]=useSearchParams();

  const search=searchParams.get("search") || "";
  const [restaurant,setRestaurant]=useState<IRestaurant[]>([]);
  const [loading,setLoading]=useState(false);

  const getDistance=(lat1:number,lon1:number,lat2:number,lon2:number):number=>{
    const R=6371;
    const dLat=((lat2-lat1)*Math.PI)/180;
    const dLon=((lon2-lon1)*Math.PI)/180;
    const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    return +(R*c).toFixed(2);
  }

  const fetchRestaurant=async()=>{
    if(!location?.latitude || !location?.longitude){
      // alert("Please allow location to continue");
      return;
    }
    try {
      setLoading(true);
      const {data}=await axios.get(`${restaurantService}/api/restaurant/all`,{
        params:{
          latitude:location.latitude,
          longitude:location.longitude
        },
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      });
      setRestaurant(data.restaurants || []);
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchRestaurant();
  },[location,search])

  if(loading || !location) {
    return <div className="flex h-[60vh] items-center justify-center">
      <p className="text-gray-500">Loading restaurants...</p>
    </div>
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 ">
      {
        restaurant.length>0 ? (<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 ">
            {
              restaurant.map((res)=>{
                const [resLng,resLat]=res.autoLocation.coordinates;
                const distance=getDistance(location.latitude,location.longitude,resLat,resLng);
                return (
                  <RestaurantCard key={res._id} id={res._id} name={res.name} image={res.image ?? ""} distance={`${distance} km`} isOpen={res.isOpen} />
                )
              })
            }
        </div>
        ) : (
        <p className="text-center text-gray-500">No restaurants found</p>
        )
      }
    </div>
  )
}

export default Home