// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import PdfSummary from "./pages/PdfSummary";
import ArticleSummary from "./pages/ArticleSummary";
import SingleCourse from "./pages/SingleCourse";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlockDiagramGenerator from "./pages/BlockDiagramGenerator";
import ProtectedRoute from "./components/ProtectedRoute";
import MyCourses from "./pages/MyCourses";
import Interview from "./pages/Interview";
import LearningPlan from "./pages/LearningPlan";

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
              <PdfSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/article-qNa"
          element={
            <ProtectedRoute>
              <ArticleSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/block-diagram-generator"
          element={
            <ProtectedRoute>
              <BlockDiagramGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily-learning-plan"
          element={
            <ProtectedRoute>
              <LearningPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/details/:title"
          element={
            <ProtectedRoute>
              <SingleCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
