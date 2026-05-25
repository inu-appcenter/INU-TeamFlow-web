'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import ProfileMenu from '@/components/mypage/ProfileMenu';
import { colleges } from '@/constants/departments';
import { useState } from 'react';
import { Check, Vote, SquarePen, UserRoundPlus, Pen } from 'lucide-react';

interface College {
  name: string;
  id: string;
  departments: string[];
}

const menuItems = [
  { icon: Vote, title: '내가 작성한 글', path: '/mypage/mypostpage' },
  { icon: SquarePen, title: '진행중인 투표', path: '/votes' },
  { icon: UserRoundPlus, title: '초대 이력', path: '/history' },
];

export default function MyPage() {
  const [selectedCollege, setSelectedCollege] = useState('it');
  const [modify, setModify] = useState(false);
  const [profileImage, setProfileImage] = useState(
    'https://images.unsplash.com/photo-1777047023536-8e47688b77f9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  );
  useState(profileImage);
  const [userName, setUserName] = useState('hong123');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [name, setName] = useState('홍길동');
  const [department, setDepartment] = useState('컴퓨터공학부');
  const [authentication, setAuthentication] = useState(false);
  const [editProfileImage, setEditProfileImage] = useState(profileImage);
  const [editName, setEditName] = useState(name);
  const [editUserName, setEditUserName] = useState(userName);
  const [editCollege, setEditCollege] = useState(selectedCollege);
  const [editDepartment, setEditDepartment] = useState(department);
  const CheckPassword = () => {
    if (!password && !checkPassword) return true;

    if (password !== checkPassword) {
      alert('새 비밀번호를 확인해주세요');
      return false;
    }

    return true;
  };
  const currentCollege = colleges.find(
    (college) => college.id === selectedCollege
  );

  const editCurrentCollege = colleges.find(
    (college) => college.id === editCollege
  );

  return (
    <main className="relative min-h-screen w-[90%] place-self-center pt-8 sm:flex sm:items-start sm:justify-center sm:gap-[10%]">
      <NotificationButton />

      {modify ? (
        //하드코딩 수정하기
        <span className="sm:mb-30 sm:pt-30">
          <div className="relative h-32 w-32 sm:h-50 sm:w-50">
            <img
              className="h-32 w-32 rounded-[50%] object-cover sm:h-50 sm:w-50"
              src="https://images.unsplash.com/photo-1777047023536-8e47688b77f9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />

            {authentication ? (
              <span className="absolute right-0 bottom-0 flex h-7 w-7 translate-x-0 translate-y-1 items-center justify-center rounded-full bg-[#A7ECA7] text-[#2C2C2C] shadow-md sm:-translate-x-2 sm:-translate-y-2">
                <Check size={20} />
              </span>
            ) : (
              <button
                onClick={() => console.log('학교 인증 요청')}
                className="absolute right-0 bottom-0 flex h-7 w-32 translate-x-[80%] translate-y-1 cursor-pointer items-center justify-center rounded-full bg-[#F67F8F] text-[#FFFFFF] shadow-md sm:translate-x-[60%] sm:-translate-y-2"
              >
                학교 인증하기
              </button>
            )}
          </div>

          <div>
            <span className="mt-3 flex justify-between whitespace-nowrap">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="이름"
                className="flex w-[50%] items-center gap-1 place-self-center rounded-xl border border-[#D6DDE5] bg-white p-1 pl-4 text-[#2C2C2C] sm:mb-1 sm:w-50"
              />

              <span className="flex gap-2 whitespace-nowrap">
                <button
                  onClick={() => {
                    if (!CheckPassword()) return;
                    setName(editName);
                    setUserName(editUserName);
                    setSelectedCollege(editCollege);
                    setDepartment(editDepartment);

                    setModify(false);
                    console.log('본인 정보 수정 요청');
                  }}
                  className="my-1 flex cursor-pointer items-center gap-1 rounded-xl bg-[#A7ECA7] px-2.5 py-2 text-[12px] font-medium text-[#2c2c2c] sm:hidden"
                >
                  완료
                </button>

                <button
                  onClick={() => setModify(false)}
                  className="my-1 flex cursor-pointer items-center gap-1 rounded-xl bg-[#D6DDE5] px-2.5 py-2 text-[12px] font-medium text-[#2c2c2c] sm:hidden"
                >
                  취소
                </button>
              </span>
            </span>

            <input
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
              className="flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white p-1 pl-4 text-[#2C2C2C] sm:w-50"
              placeholder="아이디"
            />

            <div className="mt-1 flex gap-2 whitespace-nowrap">
              <div className="relative mb-1 flex w-full flex-nowrap sm:flex-col sm:flex-wrap">
                <select
                  value={editCollege}
                  onChange={(e) => {
                    setEditCollege(e.target.value);
                    setEditDepartment('');
                  }}
                  className="mr-1 flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white px-4 py-2 text-[#2C2C2C] sm:mr-0 sm:w-50"
                >
                  <option value="">단과대 선택</option>
                  {colleges.map((college: College) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>

                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="ml-1 flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white px-4 py-2 text-[#2C2C2C] sm:mt-1 sm:ml-0 sm:w-50"
                >
                  <option value="">학과 선택</option>
                  {editCurrentCollege?.departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="my-1 flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white p-1 pl-4 text-[#2C2C2C] sm:w-50"
              placeholder="새 비밀번호"
            />

            <input
              value={checkPassword}
              onChange={(e) => setCheckPassword(e.target.value)}
              className="my-1 flex w-full items-center gap-1 rounded-xl border border-[#D6DDE5] bg-white p-1 pl-4 text-[#2C2C2C] sm:w-50"
              placeholder="새 비밀번호 확인"
            />
          </div>
          <div className="hidden gap-2 whitespace-nowrap sm:flex">
            <button
              onClick={() => {
                if (!CheckPassword()) return;

                setName(editName);
                setUserName(editUserName);
                setSelectedCollege(editCollege);
                setDepartment(editDepartment);

                setModify(false);
                console.log('본인 정보 수정 요청');
              }}
              className="my-1 flex cursor-pointer items-center gap-1 rounded-xl bg-[#A7ECA7] px-2.5 py-2 text-[12px] font-medium text-[#2c2c2c]"
            >
              완료
            </button>

            <button
              onClick={() => setModify(false)}
              className="my-1 flex cursor-pointer items-center gap-1 rounded-xl bg-[#D6DDE5] px-2.5 py-2 text-[12px] font-medium text-[#2c2c2c]"
            >
              취소
            </button>
          </div>
        </span>
      ) : (
        //하드코딩 수정하기
        <span className="sm:mb-50 sm:pt-50">
          <div className="relative h-32 w-32 sm:h-50 sm:w-50">
            <img
              className="h-32 w-32 rounded-[50%] object-cover sm:h-50 sm:w-50"
              src="https://images.unsplash.com/photo-1777047023536-8e47688b77f9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />

            {authentication ? (
              <span className="absolute right-0 bottom-0 flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-[#A7ECA7] text-[#2C2C2C] shadow-md sm:-translate-x-2 sm:-translate-y-2">
                <Check size={20} />
              </span>
            ) : (
              <button
                onClick={() => console.log('학교 인증 기능')}
                className="absolute right-0 bottom-0 flex h-7 w-32 translate-x-[80%] translate-y-1 cursor-pointer items-center justify-center rounded-full bg-[#F67F8F] text-[#FFFFFF] shadow-md sm:translate-x-[60%] sm:-translate-y-2"
              >
                학교 인증하기
              </button>
            )}
          </div>

          <div>
            <span className="mt-3 flex justify-between whitespace-nowrap">
              <h1 className="text-[24px]">{name}</h1>

              <button
                onClick={() => {
                  setEditName(name);
                  setEditUserName(userName);
                  setEditCollege(selectedCollege);
                  setEditDepartment(department);
                  setModify(true);
                }}
                className="flex cursor-pointer items-center gap-1 rounded-xl bg-[#D9DEE7] px-2.5 py-1.5 text-[12px] font-medium sm:hidden"
              >
                <Pen className="mx-1" size={12} /> 수정하기
              </button>
            </span>

            <h2 className="text-[20px] text-[#989898] sm:w-50">@{userName}</h2>

            <span className="my-1 flex gap-2 whitespace-nowrap sm:w-50 sm:wrap-break-word">
              <h2 className="text-[16px] text-[#989898]">
                {currentCollege?.name}
              </h2>
              <h2 className="text-[16px] text-[#989898]">{department}</h2>
              {authentication ? (
                <h2 className="text-[16px] text-[#989898]">202501399</h2>
              ) : undefined}
            </span>
            <button
              onClick={() => {
                setEditName(name);
                setEditUserName(userName);
                setEditCollege(selectedCollege);
                setEditDepartment(department);
                setModify(true);
              }}
              className="hidden cursor-pointer items-center gap-1 rounded-xl bg-[#D9DEE7] px-2.5 py-1.5 text-[12px] font-medium sm:flex"
            >
              <Pen className="mx-1" size={12} /> 수정하기
            </button>
          </div>
        </span>
      )}
      <ProfileMenu items={menuItems} />

      <button
        onClick={() => console.log('로그아웃')}
        className="ml-auto flex cursor-pointer text-[#989898] sm:absolute sm:top-11 sm:right-20"
      >
        로그아웃
      </button>
      {/* 
      <button onClick={() => setAuthentication((prev) => !prev)}>
        임시 인증 기능
      </button> */}

      <BottomNav />
    </main>
  );
}
