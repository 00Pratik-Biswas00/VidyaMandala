// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import PdfSummary from "./pages/PdfSummary";
import YtNotesGeneration from "./pages/YtNotesGeneration";
import ArticleSummary from "./pages/ArticleSummary";
import SingleCourse from "./pages/SingleCourse";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlockDiagramGenerator from "./pages/BlockDiagramGenerator";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pdf-summary-qNa" element={<PdfSummary />} />
        <Route path="/single-course" element={<SingleCourse />} />
        <Route path="/yt-notes-generation" element={<YtNotesGeneration />} />
        <Route path="/article-qNa" element={<ArticleSummary />} />
        <Route
          path="/block-diagram-generator"
          element={<BlockDiagramGenerator />}
        />
        <Route path="/details" element={<SingleCourse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
