import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import "./App.css"
import FlowComponent from "./components/ui/FlowComponent"
import LoginPage from "./components/studyui/LoginPage"
import ChatComponent from "./components/chatui/ChatComponent"
import GoogleDocsForm from "./components/studyui/Form"
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<FlowComponent />} />
          <Route path="/chat" element={<ChatComponent />} />
          <Route path="/form" element={<GoogleDocsForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
