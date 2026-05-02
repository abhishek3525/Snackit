import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext"
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";


const Navbar = () => {
    const {isAuth,city,quantity}=useAppData();
    const currentLocation =useLocation()

    const isHomePage=currentLocation.pathname==="/";

    const [searchParams,setSearchParams]=useSearchParams();
    const [search,setSearch]=useState(searchParams.get("search")||"")

    useEffect(()=>{
        const timer=setTimeout(()=>{
            if(search){
                setSearchParams({
                    search
                })
            }else{
                setSearchParams({})
            }
        },400)
        return ()=>clearTimeout(timer)
    },[search])

  return (
    <div className="w-full bgwhite shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link to={"/"} className="text-2xl font-bold text-[#f6de06] cursor-pointer">
                SNACKIT
            </Link>
            <div className="flex items-center gap-4">
                <Link to={'/cart'} className="relative">
                    <CgShoppingCart className="h-6 w-6 text-[#f6de06] cursor-pointer"/>
                    <span className="absolute -top-2 -right-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E23744] text-xs font-medium text-white">{quantity}</span>
                </Link>

                {
                    isAuth ? (<Link to={'/account'} className="font-medium text-[#f6de06] cursor-pointer">Account</Link>)
                    :(
                        <Link to={'/login'} className="font-medium text-[#f6de06] cursor-pointer">Login</Link>
                    )
                }
            </div>
        </div>

        {/* Search Bar */}
        {
            isHomePage && (
                <div className="border-t py-3 px-4">
                    <div className="mx-auto max-w-7xl flex items-center rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 px-3 border-r text-gray-500">
                            <BiMapPin className="h-4 w-4 text-[#f6de06]"/>
                            <span className="text-sm truncate max-w-35">{city}</span>
                        </div>
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <BiSearch className="h-4 w-4 text-gray-400"/>
                            <input type="text" placeholder="Search for restaurant" value={search} onChange={e=>setSearch(e.target.value)} className="w-full py-2 text-sm outline-none"/>
                        </div>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default Navbar