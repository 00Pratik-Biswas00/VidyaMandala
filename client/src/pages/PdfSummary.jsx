import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Particle from "../components/Particle";

const PdfSummary = () => {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleGenerateQnA = () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    // Handle QnA generation logic with `pdfFile`
  };

  const handleGenerateSummary = () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    // Handle summary generation logic with `pdfFile`
  };

  return (
    <>
      <Particle />
      <section className="  flex flex-col items-center h-screen bg-gradient-to-b from-blue-950 to-black text-white p-10">
        <h1 className="z-20 text-4xl font-bold mb-10 font-montserrat">
          Practice Question and Answers from PDFs
        </h1>

        <div className="z-20 flex flex-col  gap-4 w-full max-w-2xl mb-10 items-center justify-center">
          {/* PDF Upload Button */}
          <label className="w-full sm:w-auto bg-transparent border border-white hover:bg-slate-600 duration-500  text-white font-mono px-4 py-2 rounded-md cursor-pointer text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            Upload PDF
          </label>

          {/* Generate QnA Button */}
          <div className="flex  items-center justify-center gap-5">
            <button
              onClick={handleGenerateQnA}
              className="bg-blue-600 hover:bg-blue-800 font-ubuntu duration-500 font-medium text-white px-4 py-2 rounded-md w-full sm:w-auto"
            >
              Generate QnA
            </button>

            {/* Summary Button */}
            <button
              onClick={handleGenerateSummary}
              className="bg-blue-800 hover:bg-blue-600 duration-500 font-ubuntu font-medium text-white px-4 py-2 rounded-md "
            >
              Generate Summary
            </button>
          </div>
        </div>

        <Navbar />
      </section>
    </>
  );
};

export default PdfSummary;
