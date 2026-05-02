import axios from "axios";
import { useEffect, useState } from "react";
import { restaurantService, utilsService } from "../main";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";

interface Address{
  _id:string,
  formattedAddress?:string,
  formatedAddress?:string, // legacy DB field
  mobile:number,
}
const Checkout = () => {
  const {cart,subTotal,quantity}=useAppData();
  const [addresses,setAddresses]=useState<Address[]>([]);
  const [selectedAddressId,setSelectedAddressId]=useState<string | null>(null);
  const [loadingAddress,setLoadingAddress]=useState(true);
  const [loadingRazorpay,setLoadingRazorpay]=useState(false);
  const [creatingOrder,setCreatingOrder]=useState(false);
  
  useEffect(()=>{
    const fetchAddresses=async()=>{
      if(!cart || cart.length===0){
        setLoadingAddress(false);
        return;
      }
      try {
        const {data}=await axios.get(`${restaurantService}/api/address/all`,{
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        })
        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      }finally{
        setLoadingAddress(false);
      }
    }
    fetchAddresses();
  },[cart])

  const navigate=useNavigate();

  if(!cart || cart.length===0){
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500 text-lg">Your cart is empty</div>
      </div>
    )
  }

  
  const retaurant=cart[0].restaurantId as unknown as IRestaurant;

  const deliveryFee=subTotal<250?49:0;
  const platformFee=7;
  const grandTotal=subTotal+deliveryFee+platformFee;
  const createOrder=async(paymentMethod:"razorpay"|"stripe")=>{
    if(!selectedAddressId){
      return null;
    }
    setCreatingOrder(true);
    try {
      console.log("Creating order with payment method:", paymentMethod);
      const {data}=await axios.post(`${restaurantService}/api/order/new`,{
        paymentMethod,
        addressId:selectedAddressId,
      },{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })
      return data;
    } catch (error) {
      toast.error("Failed to create order");
    }finally{
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay=async()=>{
    try {
      setLoadingRazorpay(true);
      const order=await createOrder("razorpay")
      if(!order) return;

      const {orderId,amount}=order
      const {data}=await axios.post(`${utilsService}/api/payment/create`,{
        orderId,
      })

      const {razorpayOrderId,key}=data;

      const options={
        key,
        amount:amount*100,
        currency:"INR",
        name:"Tomato",
        description:"Food Order Payment",
        order_id:razorpayOrderId,
        handler:async(response:any)=>{
          try {
            await axios.post(`${utilsService}/api/payment/verify`,{
              razorpay_order_id:response.razorpay_order_id,
              razorpay_payment_id:response.razorpay_payment_id,
              razorpay_signature:response.razorpay_signature,
              orderId
            })
            toast.success("Payment successful✅");
            navigate("/paymentsuccess/"+response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment failed");
          }
        },
        theme:{
          color:"#E23744",
        },
      }
      const rzp=new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed please refresh page");
    }finally{
      setLoadingRazorpay(false);
    }
  }


  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{retaurant.name}</h2>
        <p className="text-gray-500 text-sm">
          {
            retaurant.autoLocation.formattedAddress
          }
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Delivery Address</h3>
          <button onClick={() => navigate("/address")} className="text-sm font-medium text-[#E23744] hover:text-red-700 cursor-pointer">+ Add New Address</button>
        </div>
        {
          loadingAddress? <p className="text-sm text-gray-500">Loading...</p> : addresses.length===0? <p className="text-sm text-gray-500">No address found</p> : addresses.map((add)=>(
            <label key={add._id} className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedAddressId===add._id?"border-[#E23744] bg-red-50":"hover:bg-gray-50"} `}>
              <input type="radio" className="accent-[#E23744]" checked={selectedAddressId===add._id} onChange={()=>setSelectedAddressId(add._id)}/>
              <div>
                <p className="text-sm font-medium">{add.formattedAddress || add.formatedAddress}</p>
                <p className="text-sm text-gray-500">{add.mobile}</p>
              </div>
            </label>
          ))
        }
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4 ">
        <h3 className="font-semibold">Order Summary</h3>
        {
          cart.map((cartItem:ICart)=>{
            const item=cartItem.itemId as unknown as IMenuItem;
            return <div className="flex justify-between text-sm " key={cartItem._id}>
              <span>
                {item.name} x {cartItem.quantity}
              </span>
              <span>
                ₹{item.price*cartItem.quantity}
              </span>
            </div>
          })
        }
        <hr />

        <div className="flex justify-between text-sm ">
          <span>Items ({quantity})</span>
          <span>₹{subTotal}</span>
        </div>
        <div className="flex justify-between text-sm ">
          <span>Delivery Fee</span>
          <span>{deliveryFee===0? "Free" : `₹${deliveryFee}`}</span>
        </div>
        {
          subTotal<250 && (
            <p className="textx-xs text-gray-500">Add item worth ₹{250-subTotal} more for free delivery</p>
          )
        }
        <div className="flex justify-between text-sm ">
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>
        <hr />
        <div className="flex justify-between text-sm font-semibold">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold"> Payment Method</h3>
        <button disabled={!selectedAddressId || loadingRazorpay || creatingOrder} onClick={payWithRazorpay} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D7FF9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">{loadingRazorpay?<BiLoader size={18} className="animate-spin"/> : <BiCreditCard size={18}/>} Pay with Razorpay</button>
        
      </div>
    </div>
  )
}

export default Checkout;