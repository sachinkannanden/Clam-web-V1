import Hero from "@/components/home/Hero";
import Manifesto from "@/components/home/Manifesto";
import TouchTest from "@/components/home/TouchTest";
import Promises from "@/components/home/Promises";
import Film from "@/components/home/Film";
import People from "@/components/home/People";
import DropList from "@/components/home/DropList";
import Breathe from "@/components/home/Breathe";

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <TouchTest />
      <Promises />
      <Film />
      <People />
      <DropList />
      <Breathe />
    </>
  );
}
