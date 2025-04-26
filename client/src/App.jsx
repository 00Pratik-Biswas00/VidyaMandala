// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './pages/Home'
import PdfSummary from "./pages/PdfSummary";
import YtNotesGeneration from "./pages/YtNotesGeneration";
import ArticleSummary from "./pages/ArticleSummary";
import SingleCourse from "./pages/SingleCourse";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pdf-summary-qNa" element={<PdfSummary/>}/>
        <Route path="/single-course" element={<SingleCourse/>}/>
        <Route path="/yt-notes-generation" element={<YtNotesGeneration/>}/>
        <Route path="/article-qNa" element={<ArticleSummary/>}/>
      </Routes>
    </BrowserRouter>
  );
}


export default App
