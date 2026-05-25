'use client';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import ProfileMenu from '@/components/mypage/ProfileMenu';
import { colleges } from '@/constants/departments';
import { useState } from 'react';
import { Check, Vote, SquarePen, UserRoundPlus, Pen } from 'lucide-react';
interface College {
  //단과대 및 학과 정보용
  id: string;
  name: string;
  departments: string[];
}
const menuItems = [
  { icon: Vote, title: '내가 작성한 글', path: '/posts' },
  { icon: SquarePen, title: '진행중인 투표', path: '/votes' },
  { icon: UserRoundPlus, title: '초대 이력', path: '/history' },
];
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
export default function MyPage({ value, onChange }: InputFieldProps) {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [modify, setModify] = useState(false);
  const [authentication, setAuthentication] = useState(false);
  const currentCollege = colleges.find(
    (college) => college.id === selectedCollege
  );
  return (
    <main className="mt-8 min-h-screen w-[90%] place-self-center">
      <NotificationButton />
      {modify ? (
        //수정하는중
        <>
          <div className="relative h-32 w-32">
            <img
              className="h-32 w-32 rounded-[50%] object-cover"
              src="https://images.unsplash.com/photo-1777047023536-8e47688b77f9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            {authentication ? (
              <span className="absolute right-0 bottom-0 flex h-7 w-7 translate-x-0 translate-y-1 items-center justify-center rounded-full bg-[#A7ECA7] text-[#2C2C2C] shadow-md">
                <Check className="" size={20} />
              </span>
            ) : (
              <a className="absolute right-0 bottom-0 flex h-7 w-32 translate-x-[80%] translate-y-1 cursor-pointer items-center justify-center rounded-full bg-[#F67F8F] text-[#FFFFFF] shadow-md">
                학교 인증하기
              </a> //클릭해서 인증화면으로 넘어가기
            )}
          </div>
          <div>
            <span className="mt-3 flex justify-between whitespace-nowrap">
              <input
                placeholder="홍길동"
                className="flex w-[50%] items-center gap-1 place-self-center rounded-xl border border-[#D6DDE5] bg-white p-1 text-[#2C2C2C]"
              />
              <span className="flex gap-2 whitespace-nowrap">
                <button
                  onClick={() => setModify(false)} // 서버 요청 보내고 false
                  className="my-1 flex cursor-pointer items-center gap-1 rounded-xl bg-[#A7ECA7] px-2.5 py-2 text-[12px] font-medium text-[#2c2c2c]"
                >
                  완료
                </button>
                <button
                  onClick={() => setModify(false)} // 서버 요청 없이 false
                  className="my-1 flex cursor-pointer items-center gap-1 rounded-xl bg-[#D6DDE5] px-2.5 py-2 text-[12px] font-medium text-[#2c2c2c]"
                >
                  취소
                </button>
              </span>
            </span>
            <input
              className="flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white p-1 text-[#2C2C2C]"
              placeholder="@hong123"
            />
            <div className="mt-1 flex gap-2 whitespace-nowrap">
              <div className="flex-between relative mb-1 flex w-full flex-nowrap">
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="mr-1 flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white px-4 py-2 text-[#2C2C2C]"
                >
                  <option value="">단과대 선택</option>
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
                  className="ml-1 flex w-full items-center gap-1 place-self-center rounded-xl border border-[#D6DDE5] bg-white px-4 py-2 text-[#2C2C2C]"
                >
                  <option value="">학과 선택</option>
                  {currentCollege?.departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input
              className="my-1 flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white p-1 text-[#2C2C2C]"
              placeholder="새 비밀번호"
            />
            <input
              className="my-1 flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white p-1 text-[#2C2C2C]"
              placeholder="새 비밀번호 확인"
            />
          </div>
        </>
      ) : (
        //위가 수정중임
        //밑이 수정안하는 상태
        <>
          <div className="relative h-32 w-32">
            <img
              className="h-32 w-32 rounded-[50%] object-cover"
              src="https://images.unsplash.com/photo-1777047023536-8e47688b77f9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            {authentication ? (
              <span className="absolute right-0 bottom-0 flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-[#A7ECA7] text-[#2C2C2C] shadow-md">
                <Check className="text-" size={20} />
              </span>
            ) : (
              <a className="absolute right-0 bottom-0 flex h-7 w-32 translate-x-[80%] translate-y-1 cursor-pointer items-center justify-center rounded-full bg-[#F67F8F] text-[#FFFFFF] shadow-md">
                학교 인증하기
              </a> //클릭해서 인증화면으로 넘어가기
            )}
          </div>
          <div>
            <span className="mt-3 flex justify-between whitespace-nowrap">
              <h1 className="text-[24px]">홍길동</h1>

              <button
                onClick={() => setModify(true)}
                className="flex cursor-pointer items-center gap-1 rounded-xl bg-[#D9DEE7] px-2.5 py-1.5 text-[12px] font-medium"
              >
                <Pen className="mx-1" size={12} /> 수정하기
              </button>
            </span>
            <h2 className="text-[20px] text-[#989898]">@hong123</h2>
            <span className="my-1 flex gap-2 whitespace-nowrap">
              <h2 className="text-[16px] text-[#989898]">정보대</h2>
              <h2 className="text-[16px] text-[#989898]">컴퓨터공학부</h2>
              {authentication ? (
                <h2 className="text-[16px] text-[#989898]">202501399</h2>
              ) : undefined}
            </span>
          </div>
        </>
        //수정 안하는중
      )}
      <ProfileMenu items={menuItems} />
      <button className="ml-auto flex cursor-pointer text-[#989898]">
        로그아웃
      </button>
      <BottomNav />
    </main>
  );
}
