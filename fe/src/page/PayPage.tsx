import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
export default function PayPage() {
  const location = useLocation();

  const [completeModal, setCompleteModal] = useState(false);
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>(location.state?.cart || []);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalCount = cart.reduce((s, i) => s + i.quantity, 0);
  const startCard = () => {
    if (window.CardBridge?.openCardApp) {
      window.CardBridge.openCardApp(totalPrice);
    } else {
      // setDebug("없음");
      alert("AndroidBridge 없음 (웹에서 실행 중)");
    }
  };

  useEffect(() => {
    window.onCardPaymentComplete = () => {
      console.log("카드 결제 완료");

      if (window.AndroidBridge?.printReceipt) {
        window.AndroidBridge.printReceipt(JSON.stringify(cart));
      }

      setCompleteModal(true);
    };
    return () => {
      window.onCardPaymentComplete = undefined;
    };
  }, []);
  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          // 최소 수량은 1개로 제한 (0개가 되면 삭제하고 싶다면 아래 removeItem 로직 참고)
          return { ...item, quantity: newQuantity < 1 ? 1 : newQuantity };
        }
        return item;
      }),
    );
  };

  useEffect(() => {
    if (!completeModal) return;

    const timer = setTimeout(() => {
      setCompleteModal(false);
      navigate("/");
    }, 5000); // 5초

    return () => clearTimeout(timer);
  }, [completeModal, navigate]);
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
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mx-6 mt-6 shadow-md">
            <p className="font-bold text-lg mb-4">주문 내역</p>

            <div className="flex flex-col gap-3">
              {cart.map((item) => {
                const itemTotal = item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    {/* 상품 */}
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        {item.price.toLocaleString()}원 × {item.quantity}
                      </span>
                    </div>

                    {/* 수량 */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow"
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold w-[90px] text-right">
                        {itemTotal.toLocaleString()}원
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 font-bold text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-gray-500">총 {totalCount}개</span>
              <span className="text-xl font-bold">
                {totalPrice.toLocaleString()}원 을 결제하실 방법을 선택해주세요
              </span>
            </div>
          </div>
        )}
        <div className="flex-1 bg-gray-100 rounded-t-3xl -mt-6 px-6 md:px-10 pt-8 pb-10 flex flex-col">
          <div className="grid grid-cols-2 gap-6 flex-1">
            <button className="bg-gray-300 border rounded-xl py-8 text-xl font-semibold shadow">
              카카오페이
            </button>

            <button
              onClick={startCard}
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
        <button
          onClick={() => {
            navigate("/cart");
          }}
          className="bg-gray-300 border rounded-xl py-8 text-xl font-semibold shadow"
        >
          취소
        </button>
      </div>

      {/* 🔥 결제 완료 모달 */}
      {/* 🔥 결제 완료 모달 */}
      {completeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-2xl text-center w-[420px]">
            <h2 className="text-3xl font-bold mb-4">결제 완료 🎉</h2>

            <p className="text-lg mb-8">영수증이 출력되었습니다.</p>

            <button
              onClick={() => {
                setCompleteModal(false);
                navigate("/");
              }}
              className="bg-green-500 text-white px-8 py-4 rounded-lg text-xl font-bold"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
