import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartList from "./CartList";

export default function Cart() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [cart] = useState([1]);

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
    <div className="min-h-screen bg-gray-200 flex justify-center">
      {/* 모바일은 w-full, md 이상은 720px */}
      <div className="w-full md:w-[720px] min-h-screen bg-[#A8CBB3] flex flex-col shadow-xl">
        {/* 상단 이미지 */}
        <div className="w-full">
          <img
            onClick={() => {
              navigate("/itemadd");
            }}
            src="/kio-banner.png"
            alt="상단 타이틀"
            className="w-full object-cover"
          />
        </div>

        {/* 본문 */}
        <div className="flex-1 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-700 text-2xl md:text-3xl">
                상품을 스캔해주세요.
              </p>
            </div>
          ) : (
            <CartList />
          )}
        </div>
      </div>
    </div>
  );
}
