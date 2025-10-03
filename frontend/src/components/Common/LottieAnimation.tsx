import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";

interface LottieAnimationProps {
  src: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  width = 200,
  height = 200,
  loop = true,
  autoplay = true,
  className = "",
}) => {
  const [animationData, setAnimationData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnimationData(data);
        setHasError(false);
      } catch (error) {
        console.error("Failed to load Lottie animation:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, [src]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl ${className}`}
        style={{ width, height }}
      >
        <div className="animate-pulse text-2xl">⚡</div>
      </div>
    );
  }

  if (hasError || !animationData) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl ${className}`}
        style={{ width, height }}
      >
        <div className="text-4xl">🔐</div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default LottieAnimation;
