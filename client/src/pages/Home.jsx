import React from "react";
import Hero from "./Hero";
import About from "./About";
import Features from "./Features";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Features />
    </div>
  );
};

export default Home;
