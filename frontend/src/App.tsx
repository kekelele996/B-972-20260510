import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Shop } from './pages/Shop'
import { Admin } from './pages/Admin'
import { Messages } from './pages/Messages'
import Orders from './pages/Orders'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
