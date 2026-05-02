import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import SelectRole from './pages/SelectRole'
import Navbar from './components/Navbar'
import Account from './pages/Account'
import { useAppData } from './context/AppContext'
import Restaurant from './pages/Restaurant'
import RestaurantPage from './pages/RestaurantPage'
import Cart from './pages/Cart'
import AddAddressPage from './pages/Address'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import Orders from './pages/Orders'
import OrderPage from './pages/OrderPage'
import RiderDashboard from './pages/RiderDashboard'
import Admin from './pages/Admin'

const App = () => {
  const {user,loading}=useAppData();

  if(loading) return <div className="text-2xl font-bold text-red-500 text-center mt-56">Loading...</div>

  if(user && user.role==="seller"){
    return <Restaurant/>;
  }
  if(user && user.role==="rider"){
    return <RiderDashboard/>;
  }
  if(user && user.role==="admin"){
    return <Admin/>;
  }
  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route element={<PublicRoute/>}>
            <Route path="/login" element={<Login/>}/>
          </Route>

          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess/>}/>
            <Route path="/orders" element={<Orders/>}/>
            <Route path="/order/:id" element={<OrderPage/>}/>
            <Route path="/address" element={<AddAddressPage/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            <Route path="/restaurant/:id" element={<RestaurantPage/>}/>
            <Route path="/select-role" element={<SelectRole/>}/>
            <Route path="/account" element={<Account/>}/>
            <Route path="/cart" element={<Cart/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App