import { useState } from 'react';

import { colleges } from '@/constants/departments';
import { INPUT_FIELD_TEXT } from '@/constants/messages';

interface Department {
  value: string;
  name: string;
  note?: string;
}

interface College {
  id: string;
  name: string;
  departments: Department[];
}

interface InputFieldProps {
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onClick?: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  fieldName: string;
  typeOption?: string;
  placeHolder?: string;
  check?: boolean;
  isSelect?: boolean;
  isInput?: boolean;
  rightElement?: React.ReactNode;
}

export default function InputField({
  fieldName,
  typeOption,
  placeHolder,
  check,
  isSelect,
  isInput,
  value,
  rightElement,
  onChange,
  onClick,
  onKeyDown,
  onKeyUp,
  onBlur,
}: InputFieldProps) {
  const [selectedCollege, setSelectedCollege] = useState('');

  const currentCollege = colleges.find(
    (college) => college.id === selectedCollege
  );

  return (
    <div className="w-full">
      <label className="mx-7.5 mb-2 block text-[14px] text-[#9C9C9C] max-[640px]:text-[12px]">
        {fieldName}
      </label>

      {isInput ? (
        <div className="mx-7.5 mb-6">
          <div className="relative">
            <input
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
              onBlur={onBlur}
              type={typeOption}
              placeholder={placeHolder}
              className={`h-13.25 w-full rounded-full bg-[#F6F8FA] px-6 text-[15px] text-[#2C2C2C] outline-none placeholder:text-[#2C2C2C] max-[640px]:p-2 max-[640px]:text-[13px] ${
                rightElement || check ? 'pr-14' : ''
              }`}
            />

            {check ? (
              <button
                type="button"
                onClick={onClick}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-4 py-2 text-[12px] text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95"
              >
                {INPUT_FIELD_TEXT.DUPLICATION_BUTTON}
              </button>
            ) : null}

            {rightElement ? (
              <div className="absolute top-1/2 right-5 -translate-y-1/2">
                {rightElement}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isSelect ? (
        <div className="relative mx-7.5 mb-6 w-full">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="h-12 w-[calc(50%-30px)] rounded-xl bg-[#F6F8FA] px-4 outline-none max-[640px]:p-0 max-[640px]:text-[14px]"
          >
            <option value="">{INPUT_FIELD_TEXT.COLLEGE_SELECT}</option>

            {colleges.map((college: College) => (
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
              <option key={department.value} value={department.value}>
                {department.name}
                {department.note ? ` ${department.note}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
