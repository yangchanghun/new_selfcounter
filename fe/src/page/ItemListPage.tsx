import { useEffect, useState } from "react";
import axios from "axios";

interface Item {
  id: number;
  name: string;
  price: number;
  product_image: string;
  barcode_number: string;
  barcode_image: string;
}

export default function ItemListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "https://www.kioedu.co.kr";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/product/list/`);
      console.log(res.data);
      setItems(res.data.product);
    } catch (err) {
      console.error("상품 불러오기 실패", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <h1 className="text-center text-2xl md:text-3xl font-bold mb-6">
        상품 목록
      </h1>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-sm md:text-base border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left">상품명</th>
              <th className="py-3 px-4 text-left">가격</th>
              <th className="py-3 px-4 text-left">바코드넘버</th>
              <th className="py-3 px-4 text-left">상품이미지</th>
              <th className="py-3 px-4 text-left">QR이미지</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  등록된 상품이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">{item.name}</td>

                  <td className="py-3 px-4">
                    {Number(item.price).toLocaleString()}원
                  </td>

                  <td className="py-3 px-4">{item.barcode_number}</td>

                  <td className="py-3 px-4">
                    <img
                      src={`${BASE_URL}${item.product_image}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <img
                      src={`${BASE_URL}${item.barcode_image}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
