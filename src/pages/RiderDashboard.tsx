import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/WhatsApp Audio 2026-05-01 at 4.23.24 PM.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenceNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailable: boolean;
}
const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(false);

  const [toggleing, setToggleing] = useState(false);

  const [incomingorder, setIncomingOrder] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("sound enabled");
    } catch (error: any) {
      toast.error("Tap again to enable sound");
    }
  };

  useEffect(() => {
    if (!socket) return;
    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrder((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId],
      );
      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setTimeout(() => {
        setIncomingOrder((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };
    socket.on("order:available", onOrderAvailable);
    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProfile(data || null);
    } catch (error) {
      setProfile(null);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchProfile();
    } else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {

    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setCurrentOrder(data?.order?.order?.[0] || data?.order?.[0] || null);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };
  useEffect(() => {
    fetchCurrentOrder();
  },[]);

  const toggleAvailabitity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access reqiured");
      return;
    }
    setToggleing(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailable: !profile?.isAvailable,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast.success(
          profile?.isAvailable ? "You are offline" : "You are online",
        );
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setToggleing(false);
      }
    });
  };

  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [drivingLicenceNumber, setDrivingLicenceNumber] = useState("");

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access reqiured");
      return;
    }
    setSubmitting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenceNumber", drivingLicenceNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());
      if (image) formData.append("file", image);

      try {
        const { data } = await axios.post(
          `${riderService}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast.success(data.message);
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        You are not refister as rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center ">
        Loading rider details..
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-2">
          <h1 className="text-xl font-semibold">Add Your Profile</h1>

          <input
            type="number"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border border-gray-300 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-2"
          />
          <input
            type="number"
            placeholder="Aadhar Number"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
            className="w-full rounded-lg border border-gray-300 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-2"
          />
          <input
            type="text"
            placeholder="Driving Licence Number"
            value={drivingLicenceNumber}
            onChange={(e) => setDrivingLicenceNumber(e.target.value)}
            className="w-full rounded-lg border border-gray-300 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-2"
          />

          <label className="flex items-center gap-3 cursor-pointer rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50 transition-colors border-gray-300 mt-2">
            <BiUpload className="h-5 w-5 text-red-500" />
            {image ? image.name : "Upload Your Profile Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>

          <button
            className="w-full rounded-lg py-3 text-sm font-semibold text-white cursor-pointer bg-[#e23744] hover:bg-[#d93b3b] transition-colors"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Adding Your Profile..." : "Add Your Profile"}{" "}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <div className="mx-auto max-w-md px-4 py-4">
        <div className="rounded bg-white p-4 shadow space-y-3">
          <img
            src={profile.picture}
            alt=""
            className="mx-auto w-24 h-24 rounded-full object-cover"
          />
          <p className="text-center font-semibold">{user?.name}</p>
          <p className="text-center text-sm text-gray-500">
            {profile.phoneNumber}
          </p>

          <div className="flex justify-center gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
              {profile.isVerified ? "Verified" : "Pending"}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
              {profile.isAvailable ? "Available" : "Not Available"}
            </span>
          </div>
          <div className="">
            <p className="text-blue-400 ">
              Please be within a 500 m radius of any restaurant (which we call a
              hotspot) before going online as a rider to recive orders.
            </p>
          </div>
          {profile.isVerified && !currentOrder && (
            <button
              className={`w-full py-2 rounded-lg text-white font-semibold ${toggleing ? "bg-gray-400" : profile.isAvailable ? "bg-gray-600" : "bg-[#e23744] "}`}
              onClick={toggleAvailabitity}
              disabled={toggleing}
            >
              {toggleing
                ? "Updating..."
                : profile.isAvailable
                  ? "Go Offline"
                  : "Go Online"}
            </button>
          )}
        </div>
      </div>
      {
        !audioUnlocked && <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                    <p className="font-medium text-blue-800">Enable Sound Notification</p>
                    <p className="text-sm text-blue-700">Get notified when new orders arrive</p>
                </div>
            </div>
            <button onClick={unlockAudio} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                Enable Sound
            </button>
        </div>
      }
      {profile.isAvailable && incomingorder.length>0 && (
        <div className="mx-auto max-w-md px-4 space-y-3">
            <h3 className="text-gray-700 font-semibold">Incoming Orders</h3>
            {
                incomingorder.map((id)=>(
                    <RiderOrderRequest key={id} orderId={id} onAccepted={()=>{
                        fetchProfile();
                        fetchCurrentOrder();
                    }}/>
                ))
            }
        </div>
      )}

      {
        currentOrder && (
          <div className="mx-auto max-w-md px-4 space-y-4">
            <RiderCurrentOrder order={currentOrder} onStatusUpdate={fetchCurrentOrder}/>
            <RiderOrderMap order={currentOrder}/>
          </div>
        )
      }
    </div>
  );
};

export default RiderDashboard;
