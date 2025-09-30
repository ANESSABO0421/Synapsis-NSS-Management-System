import React from "react";
import Hero from "./Hero";
import About from "./About";
import Features from "./Features";
import Navbar from "../components/Navbar";
import EventDisplay from "./EventDisplay";
import Gallery from "./Gallery";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Features />
      <EventDisplay/>
      <Gallery/>
    </div>
  );
};

export default Home;
