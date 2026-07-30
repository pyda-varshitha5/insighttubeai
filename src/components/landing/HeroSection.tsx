import Logo from "@/components/landing/Logo";
import BackgroundShapes from "@/components/landing/BackgroundShapes";
import { DotGrid, Sparkle } from "@/components/landing/DecorativeDots";
import FeatureList from "@/components/landing/FeatureList";

export default function HeroSection() {
  return (
<div className="relative flex h-screen w-full flex-col justify-center overflow-hidden bg-[#F4F1FD] px-10 py-16 lg:px-16">      <BackgroundShapes />
      <DotGrid className="absolute right-14 top-14 hidden lg:grid" />
      <Sparkle className="absolute right-10 top-40 h-5 w-5 hidden lg:block" />
      <Sparkle className="absolute left-[46%] top-[58%] h-4 w-4 hidden lg:block" />

      <div className="relative z-10 max-w-md">
        <Logo />

        <h1 className="mt-10 text-4xl font-extrabold leading-tight text-[#171223] lg:text-[2.65rem]">
          Learn Any Topic from YouTube,{" "}
          <span className="text-[#7C5CFC]">The Smarter Way.</span>
        </h1>

        <p className="mt-5 text-[15px] leading-relaxed text-[#6B6480]">
          InsightTube-AI uses the power of artificial intelligence to turn
          long YouTube videos into clear, concise and structured summaries so
          you can learn faster and better.
        </p>

        <FeatureList />
      </div>
    </div>
  );
}