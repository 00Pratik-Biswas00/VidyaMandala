import Navbar from "../components/Navbar";
import Particle from "../components/Particle";

const LearningPlan = () => {
  return (
    <>
      <Particle />
      <section className="  flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-black text-white p-10 pb-24">
        <h1 className="z-20 text-4xl font-bold mb-10 font-montserrat">
          Daily Learning Plan Generator
        </h1>

        <p className="mb-10 max-w-5xl text-center ">
          {" "}
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum dicta
          nulla consequuntur tempore ab enim. Inventore, temporibus iusto? Velit
          ipsa a dolores culpa, modi eos veniam veritatis ullam eum debitis!
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptas
          quaerat iure vel repudiandae vitae alias nesciunt dicta! Voluptates
          quis, vero adipisci voluptatum magni reprehenderit error ea harum
          necessitatibus. Rerum, sint?
        </p>

        <div className="z-20 flex flex-col items-center justify-center gap-5 bg-blue-950 p-7 rounded-2xl">
          <label className="w-full text-white font-mono text-lg  rounded-md cursor-pointer flex flex-col gap-2">
            Expected Completion timeframe (Months)?
            <input
              type="text"
              placeholder="eg. 6"
              className="px-4 py-2 text-black bg-gray-200 font-mono rounded-md  focus:outline-none"
            />
          </label>
          <label className="w-full text-white font-mono text-lg  rounded-md cursor-pointer flex flex-col gap-2">
            Daily study commitment (Hours)?
            <input
              type="text"
              placeholder="eg. 3"
              className="px-4 py-2 text-black bg-gray-200 font-mono rounded-md  focus:outline-none"
            />
          </label>
          <button className="bg-blue-600 hover:bg-blue-700 font-ubuntu font-semibold  text-white px-1 py-2 rounded-md  w-1/3">
            Start Quiz
          </button>
        </div>
        <Navbar />
      </section>
    </>
  );
};

export default LearningPlan;
