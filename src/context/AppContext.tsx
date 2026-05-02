import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, restaurantService } from "../main";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  async function fetchuser() {
    try {
      const token = localStorage.getItem("token");

      if (!token || token === "undefined" || token === "null") {
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      localStorage.removeItem("token");
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  const [cart, setCart] = useState<ICart[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [subTotal, setSubTotal] = useState(0);

  async function fetchCart() {
    if (!user || user.role === "seller") return;
    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCart(data.cart || []);
      setQuantity(data.cartLength);
      setSubTotal(data.subTotal);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user && user.role !== "seller") {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    fetchuser();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation)
      return alert("Please allow location to continue");
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      console.log(latitude, longitude);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const data = await res.json();
        setLocation({
          latitude,
          longitude,
          formattedAddress: data.display_name || "Current location",
        });
        setCity(
          data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            "Your location",
        );
        console.log(data.display_name);
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          formattedAddress: "Current location",
        });
        setCity("Failed to load");
      } finally {
        setLoadingLocation(false);
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        loading,
        setIsAuth,
        setLoading,
        setUser,
        user,
        location,
        loadingLocation,
        city,
        cart,
        quantity,
        subTotal,
        fetchCart,
      }}
    >
      {children}
      <Toaster />{" "}
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
