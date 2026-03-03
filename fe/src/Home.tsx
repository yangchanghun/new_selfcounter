import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioRef.current.play().catch((err: { message: any }) => {
        console.log("❌ 음성 자동 재생 실패:", err.message);
      });
    }
  }, []);

  return (
    <div
      onClick={() => {
        navigate("/cart");
      }}
      className="min-h-screen flex items-center justify-center"
    >
      {/* 모바일 프레임 */}
      <div className="w-[720px] h-screen bg-[#A8CBB3] flex flex-col items-center shadow-xl">
        {/* 🔥 상단 이미지 영역 */}
        <div className="w-full">
          <img
            src="/kio-banner.png" // ← 여기에 네가 넣을 이미지 경로
            alt="상단 타이틀"
            className="w-full object-cover"
          />
        </div>

        {/* 안내 문구 */}
        <div className="flex-1 flex font-bold items-center justify-center">
          <p className="text-gray-700 text-3xl">
            시작하시려면 화면을 터치해주세요
          </p>
        </div>
      </div>
    </div>
  );
}
