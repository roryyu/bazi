import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AIProjects from "@/components/AIProjects";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Education from "@/components/Education";
import Contact from "@/components/Contact";

export default function ResumePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <AIProjects />
      <Experience />
      <Skills />
      <Education />
      <Contact />
    </>
  );
}
