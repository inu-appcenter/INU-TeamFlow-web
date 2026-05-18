import { useState } from 'react';
import { INPUT_FIELD_TEXT } from '@/constants/messages';
import { colleges } from '@/constants/departments';

interface College {
  //단과대 및 학과 정보용
  id: string;
  name: string;
  departments: string[];
}
interface InputFieldProps {
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onClick?: () => void;
  fieldName: string; //Field 명칭을 알기 위해 필요
  typeOption?: string; //isSelect : true일때만 사용
  placeHolder?: string; //isSelect : true일때만 사용
  check?: boolean; //isSelect : true일때만 사용
  isSelect?: boolean; //list 제시 후 선택하는 칸
  isInput?: boolean; //input 형태로 사용자가 입력하는 칸
}

export default function InputField({
  fieldName,
  typeOption,
  placeHolder,
  check,
  isSelect,
  isInput,
  value,
  onChange,
  onClick,
}: InputFieldProps) {
  const [selectedCollege, setSelectedCollege] = useState('');
  const currentCollege = colleges.find(
    (college) => college.id === selectedCollege
  );

  return (
    <div className="w-full">
      <label className="mx-7.5 mb-2 block text-[14px] text-[#9c9c9c] max-[640px]:text-[12px]">
        {fieldName}
      </label>

      {isInput ? (
        <div className="relative w-full">
          <input
            value={value}
            onChange={onChange}
            type={typeOption}
            placeholder={placeHolder}
            className="mx-7.5 mb-6 h-13.25 w-[calc(100%-60px)] rounded-full bg-[#F6F8FA] px-6 text-[15px] text-[#2c2c2c] outline-none placeholder:text-[#2c2c2c] max-[640px]:p-2 max-[640px]:text-[13px]"
          />
          {check ? (
            <button
              onClick={onClick}
              type="button"
              className="absolute top-[26.5px] right-12 -translate-y-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2 text-sm text-[14px] text-white transition hover:bg-[#5C86EB] max-[640px]:px-3 max-[640px]:py-1 max-[640px]:text-[12px]"
            >
              {INPUT_FIELD_TEXT.DUPLICATION_BUTTON}
            </button>
          ) : undefined}
        </div>
      ) : undefined}

      {isSelect ? (
        <div className="relative mx-7.5 mb-6 w-full">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="h-12 w-[calc(50%-30px)] rounded-xl bg-[#F6F8FA] px-4 outline-none max-[640px]:p-0 max-[640px]:text-[14px]"
          >
            <option value="">{INPUT_FIELD_TEXT.COLLEGE_SELECT}</option>
            {colleges.map((college: College) => (
              //Dropdown 형태 수정 필요
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
          <select
            value={value}
            onChange={onChange}
            className="h-12 w-[calc(50%-30px)] rounded-xl bg-[#F6F8FA] px-4 outline-none max-[640px]:p-0 max-[640px]:text-[14px]"
          >
            <option value="">{INPUT_FIELD_TEXT.DEPARTMENT_SELECT}</option>
            {currentCollege?.departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      ) : undefined}
    </div>
  );
}
