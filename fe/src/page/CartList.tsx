import axios from "axios";
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  barcode_number: string;
}

export default function CartList() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const BASE_URL = "http://127.0.0.1:8000/";
  const [barcodeInput, setBarcodeInput] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ 상품 목록 불러오기
  useEffect(() => {
    axios.get(`${BASE_URL}/api/item/list/`).then((res) => {
      setProducts(res.data.product);
    });
  }, []);

  const totalCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const handleBarcodeInput = () => {
    const found = products.find(
      (product) => product.barcode_number === barcodeInput,
    );

    if (!found) {
      alert("상품 없음");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === found.id);

      if (existing) {
        return prev.map((item) =>
          item.id === found.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { ...found, quantity: 1 }];
    });

    setBarcodeInput(""); // 입력 초기화
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBarcodeInput();
    }
  };
  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full px-4 md:px-10 pb-6 flex flex-col"
    >
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border px-3 py-2 flex-1"
          placeholder="바코드 스캔"
        />
        <button
          onClick={handleBarcodeInput}
          className="bg-black text-white px-4"
        >
          추가
        </button>
      </div>
      <div className="flex-1 min-h-0 bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-10 flex flex-col">
        {/* 상품 수량 */}
        <div className="text-center text-gray-600 text-lg mb-4">
          상품 수량 {totalCount}
        </div>

        <div className="border-t border-gray-300 mb-4" />

        {/* 상품 리스트 */}
        {/* 상품 리스트 */}
        {/* 상품 리스트 */}
        <div className="flex-1 max-h-[500px] overflow-y-auto space-y-3 text-xl pr-2">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between">
              <div className="w-1/3">{item.name}</div>
              <div className="w-1/3 text-center">{item.quantity}개</div>
              <div className="w-1/3 text-right">
                {item.price.toLocaleString()}원
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 flex w-full h-[120px]">
          {/* 왼쪽 50% - 정산 */}
          <div className="w-1/2 flex flex-col justify-center space-y-2 pr-6">
            <div className="flex justify-between text-lg">
              <span>합계</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>

            <div className="flex justify-between text-lg text-red-500">
              <span>할인</span>
              <span>0원</span>
            </div>

            <div className="flex justify-between font-bold text-xl">
              <span>결제</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>

          {/* 오른쪽 50% - 결제 버튼 */}
          <div className="w-1/2 flex items-center justify-center">
            <button
              onClick={(e) => {
                if (cart.length === 0) {
                  alert("상품을 추가해주세요.");
                  return;
                }
                navigate("/pay", { state: { totalPrice, cart } });
                e.stopPropagation();
              }}
              className="w-full h-full bg-[#A8CBB3] hover:bg-[#97bfa6] transition-colors text-3xl font-bold rounded-2xl shadow-md"
            >
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
