'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import { colleges } from '@/constants/departments';
import {
  useMyProfile,
  useProfilePresignedUrl,
  useUpdateMyProfile,
  useUploadProfileImage,
} from '@/hooks/useUserQuery';

import {
  Check,
  Vote,
  SquarePen,
  UserRoundPlus,
  Pen,
  Camera,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

interface Department {
  value: string;
  name: string;
  note?: string;
}

interface College {
  name: string;
  id: string;
  departments: Department[];
}

const DEFAULT_PROFILE_IMAGE = '/images/default-profile.png';

const menuItems = [
  { icon: Vote, title: '내가 작성한 글', path: '/mypage/mypost' },
  { icon: SquarePen, title: '진행중인 투표', path: '/mypage/votes' },
  { icon: UserRoundPlus, title: '초대 이력', path: '/mypage/invitations' },
];

export default function MyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: profileData, isLoading, isError } = useMyProfile();
  const { mutate: updateMyProfileMutate, isPending: isUpdatePending } =
    useUpdateMyProfile();
  const { mutate: presignedUrlMutate, isPending: isPresignedPending } =
    useProfilePresignedUrl();
  const { mutate: uploadImageMutate, isPending: isUploadPending } =
    useUploadProfileImage();
  const [modify, setModify] = useState(false);

  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  const [editProfileImage, setEditProfileImage] = useState('');
  const [editImageKey, setEditImageKey] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const currentCollege = colleges.find((college) =>
    college.departments.some(
      (department) => department.value === profileData?.department
    )
  );

  const editCurrentCollege = colleges.find((college) =>
    college.departments.some(
      (department) => department.value === editDepartment
    )
  );

  const isImagePending = isPresignedPending || isUploadPending;

  const checkPasswordValid = () => {
    if (!password && !checkPassword) return true;

    if (password !== checkPassword) {
      alert('새 비밀번호를 확인해주세요');
      return false;
    }

    return true;
  };

  const startModify = () => {
    if (!profileData) return;

    setEditProfileImage(profileData.imageUrl ?? DEFAULT_PROFILE_IMAGE);
    setEditImageKey(null);
    setEditName(profileData.name);
    setEditDepartment(profileData.department);
    setEditEmail(profileData.email);
    setPassword('');
    setCheckPassword('');
    setModify(true);
  };

  const saveModify = () => {
    if (!profileData || !checkPasswordValid()) return;

    const request = {
      email: profileData.email,
      name: editName,
      department: editDepartment,
      ...(editImageKey ? { imageKey: editImageKey } : {}),
      ...(password ? { password } : {}),
    };

    console.log('수정 요청:', request);

    updateMyProfileMutate(request, {
      onSuccess: () => {
        alert('프로필이 수정되었습니다.');
        setPassword('');
        setCheckPassword('');
        setEditImageKey(null);
        setModify(false);
      },
      onError: () => {
        alert('프로필 수정에 실패했습니다.');
      },
    });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    presignedUrlMutate(
      {
        fileName: file.name,
        contentType: file.type,
      },
      {
        onSuccess: ({ uploadUrl, imageKey }) => {
          uploadImageMutate(
            {
              uploadUrl,
              file,
            },
            {
              onSuccess: () => {
                setEditProfileImage(URL.createObjectURL(file));
                setEditImageKey(imageKey);
              },
              onError: () => {
                alert('이미지 업로드에 실패했습니다.');
              },
            }
          );
        },
        onError: () => {
          alert('이미지 업로드 URL 발급에 실패했습니다.');
        },
      }
    );
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    router.push('/signin');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-[15px] text-[#989898]">프로필을 불러오는 중...</p>
      </main>
    );
  }

  if (isError || !profileData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-[15px] text-[#989898]">
          프로필 정보를 불러오지 못했습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-6 pb-28 sm:px-6 sm:pt-10">
      <NotificationButton />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleProfileImageChange}
        className="hidden"
      />

      <header className="mx-auto mt-10 mb-5 flex max-w-[1180px] items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/main')}
            className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>

          <div>
            <h1 className="text-[26px] font-bold text-[#2C2C2C]">마이페이지</h1>
            <p className="mt-1 text-[14px] text-[#989898]">
              내 프로필과 활동 정보를 확인해요
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex cursor-pointer items-center gap-1 rounded-xl bg-[#D9DEE7] px-3 py-2 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-90"
        >
          <LogOut size={14} />
          로그아웃
        </button>
      </header>

      <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-5 lg:grid-cols-[450px_1fr]">
        <section className="rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-7 transition-all duration-200 lg:min-h-[540px]">
          <div className="flex h-full flex-col items-center justify-center">
            <div className="relative h-36 w-36 transition-all duration-200 sm:h-44 sm:w-44">
              <img
                src={
                  modify
                    ? editProfileImage
                    : (profileData.imageUrl ?? DEFAULT_PROFILE_IMAGE)
                }
                alt="프로필 이미지"
                className="h-full w-full rounded-full object-cover transition-all duration-200"
              />

              {modify ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImagePending}
                  className="absolute right-1 bottom-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#5E92F0] text-white shadow-md transition-all duration-150 active:scale-90 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
                >
                  <Camera size={17} />
                </button>
              ) : profileData.isSchoolVerified ? (
                <span className="absolute right-1 bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#A7ECA7] text-[#2C2C2C] shadow-md">
                  <Check size={21} />
                </span>
              ) : (
                <button
                  onClick={() => router.push('/mypage/authentication')}
                  className="absolute -right-12 bottom-1 rounded-full bg-[#F67F8F] px-3 py-1.5 text-[12px] font-medium text-white shadow-md transition-all duration-150 active:scale-90"
                >
                  학교 인증
                </button>
              )}
            </div>

            {!modify ? (
              <div className="animate-modal-pop flex w-full flex-col items-center">
                <h2 className="mt-5 text-[24px] font-bold text-[#2C2C2C]">
                  {profileData.name}
                </h2>

                <p className="mt-1 text-[18px] text-[#989898]">
                  @{profileData.username}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2 text-[16px] text-[#989898]">
                  <span>{currentCollege?.name}</span>
                  <span>·</span>
                  <span>
                    {
                      currentCollege?.departments.find(
                        (department) =>
                          department.value === profileData.department
                      )?.name
                    }
                  </span>
                </div>

                {profileData.isSchoolVerified && (
                  <p className="mt-1 text-[16px] text-[#989898]">
                    {profileData.studentNumber}
                  </p>
                )}

                <div className="mt-8 w-full rounded-2xl bg-[#FBFBFB] p-5 transition-all duration-150">
                  <p className="text-[16px] font-medium text-[#2C2C2C]">
                    프로필 정보
                  </p>
                  <p className="mt-1 text-[14px] text-[#989898]">
                    이름, 비밀번호, 소속 정보를 수정할 수 있어요.
                  </p>
                </div>

                <button
                  onClick={startModify}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-[#D9DEE7] px-2.5 py-3 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-95"
                >
                  <Pen size={12} />
                  수정하기
                </button>
              </div>
            ) : (
              <div className="animate-modal-pop mt-6 w-full">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="이름"
                  className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0]"
                />

                <input
                  value={profileData.username}
                  disabled
                  placeholder="아이디"
                  className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-[#F5F5F5] p-2.5 pl-4 text-[#989898] outline-none"
                />

                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="이메일"
                  className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0]"
                />

                <div className="mb-2">
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full rounded-xl border border-[#D6DDE5] bg-white px-3 py-2.5 text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0]"
                  >
                    <option value="">학과 선택</option>
                    {colleges.map((college: College) => (
                      <optgroup key={college.id} label={college.name}>
                        {college.departments.map((department) => (
                          <option
                            key={department.value}
                            value={department.value}
                          >
                            {department.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="새 비밀번호"
                  className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0]"
                />

                <input
                  value={checkPassword}
                  onChange={(e) => setCheckPassword(e.target.value)}
                  type="password"
                  placeholder="새 비밀번호 확인"
                  className="mb-3 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0]"
                />

                <div className="flex gap-2">
                  <button
                    onClick={saveModify}
                    disabled={isUpdatePending || isImagePending}
                    className="flex-1 cursor-pointer rounded-xl bg-[#A7ECA7] px-2.5 py-3 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#D6DDE5]"
                  >
                    {isUpdatePending ? '저장 중...' : '완료'}
                  </button>

                  <button
                    onClick={() => setModify(false)}
                    className="flex-1 cursor-pointer rounded-xl bg-[#D6DDE5] px-2.5 py-3 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-95"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <section className="rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5 transition-all duration-200">
            <h3 className="mb-5 text-[20px] font-bold text-[#2C2C2C]">
              내 활동
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#FBFBFB] px-4 py-5 text-left text-[#2C2C2C] transition-all duration-150 active:scale-95"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                      <Icon size={18} />
                    </span>

                    <span className="text-[18px] font-normal">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5 transition-all duration-200">
            <h3 className="text-[20px] font-bold text-[#2C2C2C]">계정 상태</h3>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#FBFBFB] p-5 transition-all duration-150 active:scale-95">
                <p className="text-[16px] font-medium text-[#2C2C2C]">
                  학교 인증
                </p>
                <p className="mt-1 text-[14px] text-[#989898]">
                  {profileData.isSchoolVerified
                    ? '인증이 완료된 계정입니다.'
                    : '아직 학교 인증이 필요합니다.'}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FBFBFB] p-5 transition-all duration-150 active:scale-95">
                <p className="text-[16px] font-medium text-[#2C2C2C]">
                  소속 정보
                </p>
                <p className="mt-1 text-[14px] text-[#989898]">
                  {currentCollege?.name} ·{' '}
                  {
                    currentCollege?.departments.find(
                      (department) =>
                        department.value === profileData.department
                    )?.name
                  }
                </p>
              </div>
            </div>

            {!profileData.isSchoolVerified && (
              <button
                onClick={() => router.push('/mypage/authentication')}
                className="mt-4 w-full cursor-pointer rounded-xl bg-[#F67F8F] py-3 text-[12px] font-medium text-white transition-all duration-150 active:scale-95"
              >
                학교 인증하러 가기
              </button>
            )}
          </section>
        </section>
      </section>

      <BottomNav />
    </main>
  );
}
