import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PayPage() {
  const location = useLocation();
  const totalPrice = location.state?.totalPrice || 0;
  const cart = location.state?.cart || [];

  const [payModal, setPayModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const navigate = useNavigate();
  // 🔥 10초 후 자동 결제
  useEffect(() => {
    if (!payModal) return;

    const timer = setTimeout(() => {
      if (window.AndroidBridge?.printReceipt) {
        try {
          window.AndroidBridge.printReceipt(JSON.stringify(cart));
        } catch (e) {
          console.log("프린트 실패:", e);
        }
      }

      setPayModal(false);
      setCompleteModal(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [payModal, cart]);

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full md:w-[720px] min-h-screen bg-[#A8CBB3] flex flex-col shadow-xl">
        <div className="w-full">
          <img
            src="/kio-banner.png"
            alt="상단 타이틀"
            className="w-full object-cover"
          />
        </div>

        <div className="flex-1 bg-gray-100 rounded-t-3xl -mt-6 px-6 md:px-10 pt-8 pb-10 flex flex-col">
          <div className="bg-white shadow rounded-lg py-4 px-4 text-center text-lg font-medium mb-8">
            <span className="font-bold text-xl">
              {totalPrice.toLocaleString()}원
            </span>
            을 결제하실 방법을 선택해주세요
          </div>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <button className="bg-gray-300 border rounded-xl py-8 text-xl font-semibold shadow">
              카카오페이
            </button>

            <button
              onClick={() => setPayModal(true)}
              className="bg-white border rounded-xl py-8 text-xl font-semibold shadow"
            >
              카드결제
            </button>

            <button className="bg-gray-300 border rounded-xl py-8 text-xl font-semibold shadow">
              현금결제
            </button>

            <button className="bg-gray-300 border rounded-xl py-8 text-xl font-semibold shadow">
              QR결제
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 카드 결제 모달 */}
      {payModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <img src="card_modal.gif" alt="카드 결제" />
            <p className="mt-4 text-lg">카드 단말기에 카드를 삽입해주세요...</p>

            <p
              onClick={() => setPayModal(false)}
              className="text-center text-2xl font-semibold mt-6 cursor-pointer text-red-500"
            >
              취소
            </p>
          </div>
        </div>
      )}

      {/* 🔥 결제 완료 모달 */}
      {completeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl text-center">
            <h2 className="text-3xl font-bold mb-4">결제 완료 🎉</h2>
            <p className="text-lg mb-6">영수증이 출력되었습니다.</p>
            <button
              onClick={() => {
                setCompleteModal(false);
                navigate("/");
              }}
              className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
