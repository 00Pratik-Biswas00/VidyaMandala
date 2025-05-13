// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './pages/Home'
import PdfSummary from "./pages/PdfSummary";
import YtNotesGeneration from "./pages/YtNotesGeneration";
import ArticleSummary from "./pages/ArticleSummary";
import SingleCourse from "./pages/SingleCourse";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/pdf-summary-qNa" 
          element={
            <ProtectedRoute>
              <PdfSummary/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/single-course" 
          element={
            <ProtectedRoute>
              <SingleCourse/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/yt-notes-generation" 
          element={
            <ProtectedRoute>
              <YtNotesGeneration/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/article-qNa" 
          element={
            <ProtectedRoute>
              <ArticleSummary/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/details" 
          element={
            <ProtectedRoute>
              <SingleCourse/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App
