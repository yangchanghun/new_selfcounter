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
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inputValue, setInputValue] = useState(""); // 스캔 데이터를 담을 state
  const [debugScan, setDebugScan] = useState("");
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const lastScannedRef = useRef<{ barcode: string; time: number }>({
    barcode: "",
    time: 0,
  });
  // 1. 서버에서 상품 목록 로드
  useEffect(() => {
    axios.get(`https://www.kioedu.co.kr/api/product/list/`).then((res) => {
      // API 구조에 맞춰 product 배열 설정
      setProducts(res.data.product || []);
    });
  }, []);

  // 2. 입력값 변경 핸들러
  const onDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 3. 엔터키 입력 시 데이터 처리 (핵심 로직)
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const raw = inputValue.trim();
      // console.log(products);
      // console.log(raw);
      if (!raw) return;

      const now = Date.now();
      // 동일한 바코드가 500ms(0.5초) 이내에 다시 들어오면 무시
      if (
        raw === lastScannedRef.current.barcode &&
        now - lastScannedRef.current.time < 500
      ) {
        console.log("중복 스캔 차단됨:", raw);
        setInputValue(""); // 입력창만 비우고 리턴
        return;
      }

      lastScannedRef.current = { barcode: raw, time: now };

      // 한글 입력 방지 체크
      if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(raw)) {
        setInputValue("");
        alert("키보드 상태를 영문으로 변경해주세요.");
        return;
      }

      let scannedBarcode = "";

      // [파싱 로직] JSON 인지 일반 숫자인지 확인
      try {
        const parsed = JSON.parse(raw);
        scannedBarcode = parsed.barcode_number
          ? parsed.barcode_number.toString()
          : raw;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // JSON이 아니면 정규식으로 숫자만 추출 시도하거나 전체를 바코드로 인식
        const match = raw.match(/barcode_number[:"]*([0-9]+)/);
        scannedBarcode = match ? match[1] : raw;
      }
      // [장바구니 추가 로직]
      const matched = products.find((p) => {
        // console.log("매칭 시도:", p.barcode_number, scannedBarcode);
        // 결과값을 명시적으로 return 해줘야 합니다.
        return String(p.barcode_number) === String(scannedBarcode);
      });

      if (matched) {
        setCart((prevCart) => {
          const exist = prevCart.find((item) => item.id === matched.id);
          if (exist) {
            return prevCart.map((item) =>
              item.id === matched.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [
            ...prevCart,
            {
              id: matched.id,
              name: matched.name,
              price: matched.price,
              quantity: 1,
            },
          ];
        });
        setDebugScan(`성공: ${matched.name}`);
      } else {
        setDebugScan(`실패: ${scannedBarcode}`);
        alert(`상품 정보가 없습니다. (${scannedBarcode})`);
      }

      setInputValue(""); // 입력창 초기화
    }
  };

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
      {/* 💡 숨겨진 스캔 전용 인풋 */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={inputValue}
        onChange={onDataChange}
        onKeyDown={onKeyDown}
        // inputMode="none"
        autoFocus
        // className="absolute opacity-0 pointer-events-none"
        onBlur={() => setTimeout(() => hiddenInputRef.current?.focus(), 100)}
      />

      <div className="flex-1 bg-white rounded-3xl shadow-xl p-6 flex flex-col overflow-hidden">
        <div className="text-center text-gray-500 mb-2">
          상품 수량 {totalCount}
        </div>
        <div className="text-red-500 font-mono text-center mb-4">
          스캔 상태: {debugScan || "대기 중..."}
        </div>

        {/* 장바구니 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-300 italic">
              상품을 스캔해 주세요.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-xl border-b pb-2"
              >
                <span className="flex-1 font-bold">{item.name}</span>
                <span className="w-20 text-center text-blue-600 font-black">
                  {item.quantity}개
                </span>
                <span className="w-32 text-right">
                  {item.price.toLocaleString()}원
                </span>
              </div>
            ))
          )}
        </div>

        {/* 결제 영역 */}
        <div className="mt-6 border-t pt-6 flex gap-4 h-32">
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between text-gray-600 text-lg">
              <span>합계</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-2xl font-black mt-2 text-red-600">
              <span>결제금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          <button
            onClick={() =>
              cart.length > 0 &&
              navigate("/pay", { state: { totalPrice, cart } })
            }
            className={`flex-1 text-3xl font-bold rounded-2xl shadow-md transition-colors ${
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
