import { Outlet } from "react-router"
import Header from "../components/Header"



const AppLayout = () => {
  return (
    <div>
      <div> <Header/> </div>
      <div> <Outlet/> </div>
    </div>
  )
}

export default AppLayout
