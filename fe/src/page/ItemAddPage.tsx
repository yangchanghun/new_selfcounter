import { useState } from "react";
import axios from "axios";

export default function ItemAddPage() {
  const [form, setForm] = useState({
    id: 1,
    name: "",
    price: "",
    barcode_number: "",
    product_image: null as File | null,
  });

  const REACT_APP_BASE_URL = "https://www.kioedu.co.kr";
  const [errorMsg, setErrorMsg] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "product_image" && files) {
      setForm((prev) => ({ ...prev, product_image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("상품 이름을 입력해주세요.");
      return;
    }

    if (!form.price) {
      alert("가격을 입력해주세요.");
      return;
    }

    if (!form.product_image) {
      alert("상품 이미지를 선택해주세요.");
      return;
    }
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("price", form.price);

      if (form.barcode_number) {
        formData.append("barcode_number", form.barcode_number);
      }

      if (form.product_image) {
        formData.append("product_image", form.product_image);
      }

      const res = await axios.post(
        `${REACT_APP_BASE_URL}/api/product/register/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("상품 등록 완료 🔥");
      console.log(res.data);
      setForm({
        id: 1,
        name: "",
        price: "",
        barcode_number: "",
        product_image: null,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg("등록 실패");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* 상품이름 */}
        <div className="flex items-center gap-4">
          <label className="w-28 text-sm font-medium">상품이름</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="flex-1 bg-gray-200 rounded-md px-3 py-2"
          />
        </div>

        {/* 가격 */}
        <div className="flex items-center gap-4">
          <label className="w-28 text-sm font-medium">가격</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="flex-1 bg-gray-200 rounded-md px-3 py-2"
          />
        </div>

        {/* 바코드번호 */}
        <div className="flex items-center gap-4">
          <label className="w-28 text-sm font-medium">바코드번호</label>
          <input
            placeholder="미입력시 랜덤번호 생성"
            name="barcode_number"
            value={form.barcode_number}
            onChange={handleChange}
            className="flex-1 bg-gray-200 rounded-md px-3 py-2"
          />
        </div>

        {/* 상품이미지 */}
        <div className="flex items-center gap-4">
          <label className="w-28 text-sm font-medium">상품이미지</label>
          <input
            name="product_image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="flex-1"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-gray-400 hover:bg-gray-500 px-6 py-2 rounded-md font-medium text-white"
          >
            생성
          </button>
        </div>
      </div>
      {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
    </div>
  );
}
