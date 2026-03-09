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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setProducts] = useState<Product[]>([]);
  const [debugScan, setDebugScan] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef<number>(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // 상품 목록 로드
  useEffect(() => {
    axios.get(`https://www.kioedu.co.kr/api/product/list/`).then((res) => {
      console.log(res.data.product);
      setProducts(res.data.product);
    });
  }, []);

  // 장바구니 추가 로직
  const handleBarcode = useCallback((barcode: string) => {
    setProducts((currentProducts) => {
      const found = currentProducts.find((p) => p.barcode_number === barcode);
      if (!found) {
        setDebugScan(`미등록 상품: ${barcode}`);
        return currentProducts;
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
      return currentProducts;
    });
  }, []);

  // 데이터 파싱 (JSON & 숫자)
  const processRawData = (raw: string) => {
    const data = raw.trim();
    if (!data) return;

    // 1. JSON 시도
    try {
      const parsed = JSON.parse(data);
      if (parsed.barcode_number) {
        handleBarcode(parsed.barcode_number.toString());
        setDebugScan(`JSON: ${parsed.barcode_number}`);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (e) {}

    // 2. 정규식 시도
    const match = data.match(/barcode_number[:"]*([0-9]+)/);
    if (match) {
      handleBarcode(match[1]);
      setDebugScan(`Pattern: ${match[1]}`);
      return;
    }

    // 3. 일반 숫자 바코드 시도
    if (/^\d+$/.test(data)) {
      handleBarcode(data);
      setDebugScan(`Number: ${data}`);
      return;
    }
    setDebugScan(`Unknown: ${data}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      // 스캐너 입력은 매우 빠르므로 100ms 간격으로 버퍼 관리
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
      {/* 키보드 방지용 가짜 인풋 (필요시) */}
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
          상품 수량 {totalCount}
        </div>
        <div className="text-red-500 font-mono text-center mb-4">
          스캔: {debugScan || "대기 중..."}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-xl border-b pb-2"
            >
              <span className="flex-1 font-bold">{item.name}</span>
              <span className="w-20 text-center text-blue-600">
                {item.quantity}개
              </span>
              <span className="w-32 text-right">
                {(item.price * item.quantity).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-6 flex gap-4 h-32">
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between text-gray-600">
              <span>합계</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-2xl font-black mt-2">
              <span>결제금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          <button
            onClick={() =>
              cart.length > 0 &&
              navigate("/pay", { state: { totalPrice, cart } })
            }
            className={`flex-1 text-3xl font-bold rounded-2xl ${cart.length > 0 ? "bg-[#A8CBB3]" : "bg-gray-200 text-gray-400"}`}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
