import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

import Navbar from "../components/Navbar";
import Particle from "../components/Particle";
import Header from "../components/Header";

const PdfSummary = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const summaryRef = useRef();

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

  const handleGenerateSummary = async () => {
    setLoading(true);
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await fetch(
        "http://localhost:5000/pdf/generate-summary",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
      } else {
        alert(data.error || "Failed to generate summary");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const input = summaryRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("pdf_summary.pdf");
  };

  return (
    <>
      <Header/>
      <Particle />
      <section className="  flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-black text-white p-10 pb-24">
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

          {pdfFile && (
            <p className="text-green-300 font-mono">
              {pdfFile.name} is uploaded ✅
            </p>
          )}

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
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Summary"}
            </button>
          </div>
        </div>

        {summary && (
          <div className="z-20 flex flex-col items-center justify-center gap-5 w-full h-full max-w-5xl">
            <div
              ref={summaryRef}
              className="  bg-white text-black p-4 rounded-md  mt-5"
            >
              <h2 className="font-bold text-lg mb-2">📄 Summary:</h2>
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="my-6 text-2xl font-bold text-blue-800"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="my-6 text-xl font-semibold text-blue-700"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="my-6 text-lg font-semibold text-blue-600"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p
                      className="mb-4 text-gray-800 leading-relaxed"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li className="ml-6 list-disc mb-2" {...props} />
                  ),
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>{" "}
            <button
              onClick={handleDownloadPDF}
              className=" bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-ubuntu"
            >
              Download PDF
            </button>
          </div>
        )}

        <Navbar />
      </section>
    </>
  );
};

export default PdfSummary;
