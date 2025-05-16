// update 3
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Particle from "../components/Particle";
import Header from "../components/Header";

const BlockDiagramGenerator = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setImage("");
    setPdfUrl("");

    try {
      const res = await fetch("http://localhost:5000/block/generate-diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (data.image) {
        setImage(data.image);
        setPdfUrl(`http://localhost:5000/block${data.pdf_url}`);
      } else {
        alert("Failed to generate diagram.");
      }
    } catch (err) {
      console.error("Error generating diagram:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="z-20 absolute w-full"><Header/></div>
      <Particle />
      <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-24">
        <h1 className="z-20 text-lg px-4 font-semibold mb-10 truncate max-w-md text-center  bg-gray-800 bg-opacity-70 border border-gray-600 rounded-full py-3 shadow-sm tracking-wider">
          Generate Block Diagram from Text
        </h1>

        <div className="z-20 flex flex-col items-center gap-7 w-full max-w-6xl mb-7">
          <textarea
            placeholder="Enter text ...."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="px-4 py-2 h-[17rem] text-black placeholder:text-gray-700 bg-blue-200 rounded-md w-full focus:outline-none"
            rows={6}
          />
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 font-semibold text-white px-6 py-2 rounded-md w-1/3"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Diagram"}
          </button>
        </div>

        {image && (
          <div className="z-20 flex flex-col items-center w-full max-w-6xl h-full">
            <h1 className="z-20 text-3xl font-bold mb-10  text-center">
              Your Result
            </h1>
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated Diagram"
              className="w-full h-full mb-4 border border-white rounded-md shadow-md"
            />
            <a
              href={pdfUrl}
              download="block_diagram.pdf"
              className=" bg-gradient-to-r from-green-400 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-2 rounded-md"
            >
              Download PDF
            </a>
          </div>
        )}

        <Navbar />
      </section>
    </>
  );
};

export default BlockDiagramGenerator;
