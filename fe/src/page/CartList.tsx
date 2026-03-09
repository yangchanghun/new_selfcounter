import axios from "axios";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
  const navigate = useNavigate();
  // 💡 상품 원본 데이터를 저장할 상태 (setProducts를 사용하도록 수정)
  const [, setProducts] = useState<Product[]>([]);
  const [debugScan, setDebugScan] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef<number>(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // ✅ 1. 서버에서 상품 목록 로드
  useEffect(() => {
    axios.get(`https://www.kioedu.co.kr/api/product/list/`).then((res) => {
      // API 응답 구조에 따라 res.data 혹은 res.data.product 확인 필요
      const fetchedProducts = res.data.product || res.data;
      setProducts(fetchedProducts);
    });
  }, []);

  // ✅ 2. 바코드 매칭 및 장바구니 추가 핵심 로직
  const handleBarcode = useCallback((barcode: string) => {
    setProducts((currentProducts) => {
      // 받아온 상품 리스트에서 바코드가 일치하는 녀석 찾기
      const found = currentProducts.find(
        (p) => String(p.barcode_number) === String(barcode),
      );

      if (!found) {
        setDebugScan(`미등록 상품: ${barcode}`);
        return currentProducts;
      }

      // 장바구니 업데이트
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === found.id);
        if (existingItem) {
          // 이미 있으면 수량 +1
          return prevCart.map((item) =>
            item.id === found.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        // 없으면 새로 추가
        return [
          ...prevCart,
          { id: found.id, name: found.name, price: found.price, quantity: 1 },
        ];
      });

      setDebugScan(`추가 완료: ${found.name}`);
      return currentProducts;
    });
  }, []);

  // ✅ 3. 스캐너 데이터 처리 (순수 숫자 & JSON 모두 지원)
  const processRawData = (raw: string) => {
    const data = raw.trim();
    if (!data) return;

    // A. JSON 형식인 경우: {"barcode_number": "123..."}
    try {
      const parsed = JSON.parse(data);
      if (parsed.barcode_number) {
        handleBarcode(parsed.barcode_number.toString());
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* JSON 아님 */
    }

    // B. 특정 패턴인 경우: barcode_number:123...
    const match = data.match(/barcode_number[:"]*([0-9]+)/);
    if (match) {
      handleBarcode(match[1]);
      return;
    }

    // C. 일반 숫자 바코드인 경우 (질문하신 1234567891026 형태)
    if (/^\d+$/.test(data)) {
      handleBarcode(data);
      return;
    }

    setDebugScan(`형식 인식 불가: ${data}`);
  };

  // ✅ 4. 전역 키 입력 리스너 (스캐너 대응)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyTimeRef.current > 100) bufferRef.current = "";
      lastKeyTimeRef.current = now;

      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        processRawData(bufferRef.current);
        bufferRef.current = "";
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBarcode]);

  const totalPrice = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.quantity, 0),
    [cart],
  );
  const totalCount = useMemo(
    () => cart.reduce((s, i) => s + i.quantity, 0),
    [cart],
  );

  return (
    <div className="h-full px-4 md:px-10 pb-6 flex flex-col relative">
      {/* 키보드 방지 트릭 */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="none"
        autoFocus
        className="absolute opacity-0 pointer-events-none"
        onBlur={() => setTimeout(() => hiddenInputRef.current?.focus(), 100)}
      />

      <div className="flex-1 bg-white rounded-3xl shadow-xl p-6 flex flex-col overflow-hidden">
        <div className="text-center text-gray-500 mb-2">
          총 {totalCount}개의 상품
        </div>
        <div className="text-red-500 font-bold text-center mb-4 bg-red-50 py-2 rounded-xl">
          {debugScan || "상품 바코드를 스캔하세요"}
        </div>

        {/* 장바구니 리스트 UI */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-300">
              비어있음
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-xl border-b pb-3"
              >
                <div className="flex flex-col">
                  <span className="font-bold">{item.name}</span>
                  <span className="text-sm text-gray-400">
                    {item.price.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-blue-600 font-black">
                    {item.quantity}개
                  </span>
                  <span className="font-bold w-28 text-right">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 결제 영역 */}
        <div className="mt-6 border-t pt-6 flex gap-4 h-32">
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between text-gray-600">
              <span>총 합계</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-3xl font-black mt-2 text-red-600">
              <span>결제액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          <button
            onClick={() =>
              cart.length > 0 &&
              navigate("/pay", { state: { totalPrice, cart } })
            }
            className={`flex-1 text-3xl font-bold rounded-2xl transition-colors ${
              cart.length > 0
                ? "bg-[#A8CBB3] text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
