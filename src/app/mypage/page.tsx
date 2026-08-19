'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import { colleges } from '@/constants/departments';
import {
  useDeleteUser,
  useMyProfile,
  useProfilePresignedUrl,
  useUpdateMyProfile,
  useUploadProfileImage,
} from '@/hooks/useUserQuery';
import { useFcm } from '@/hooks/useFcm';
import { useErrorToast } from '@/hooks/useErrorToast';
import {
  Check,
  Vote,
  SquarePen,
  UserRoundPlus,
  Pen,
  Camera,
  LogOut,
  X,
  Bookmark,
  MessageCircleQuestion,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import Header from '@/components/common/Header';

//이걸 복붙해서 사용해주세요
//Header 연결을 위한 입력 공간
//1. 페이지 이름을 입력해주세요
const pageName = '마이페이지';

//2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
const isSearch = false;

//3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCreate = false;

//4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCategory = false;

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
  { icon: SquarePen, title: '내가 작성한 글', path: '/mypage/mypost' },
  { icon: Vote, title: '내 투표', path: '/mypage/votes' },
  { icon: UserRoundPlus, title: '초대 이력', path: '/mypage/invitations' },
  { icon: Bookmark, title: '스크랩', path: '/mypage/scraps' },
  { icon: MessageCircleQuestion, title: '문의하기', path: '/mypage/inquiry' },
];

export default function MyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { unregisterFcmToken } = useFcm();

  const {
    data: profileData,
    isLoading,
    isError,
    refetch: refetchProfile,
  } = useMyProfile();
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { errorMessage, showErrorMessage } = useErrorToast();
  const [isProfileImageMenuOpen, setIsProfileImageMenuOpen] = useState(false);
  const [isDefaultImageSelected, setIsDefaultImageSelected] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { mutateAsync: deleteUser, isPending: isDeleteUserPending } =
    useDeleteUser();
  const isAdmin = profileData?.role === 'ADMIN';
  const currentCollege = colleges.find((college) =>
    college.departments.some(
      (department) => department.value === profileData?.department
    )
  );

  const isImagePending = isPresignedPending || isUploadPending;

  const openDeleteUserConfirm = () => {
    setDeleteConfirmText('');
    setIsDeleteUserConfirmOpen(true);
  };

  const closeDeleteUserConfirm = () => {
    if (isDeleteUserPending) return;

    setDeleteConfirmText('');
    setIsDeleteUserConfirmOpen(false);
  };

  useEffect(() => {
    const isOverlayOpen =
      isProfileImageMenuOpen || isSettingsOpen || isDeleteUserConfirmOpen;

    if (!isOverlayOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (isDeleteUserConfirmOpen) {
        if (!isDeleteUserPending) {
          setDeleteConfirmText('');
          setIsDeleteUserConfirmOpen(false);
        }
        return;
      }

      if (isProfileImageMenuOpen) {
        setIsProfileImageMenuOpen(false);
        return;
      }

      setIsSettingsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isDeleteUserConfirmOpen,
    isDeleteUserPending,
    isProfileImageMenuOpen,
    isSettingsOpen,
  ]);

  const extractImageKey = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    try {
      return decodeURIComponent(new URL(imageUrl).pathname.replace(/^\/+/, ''));
    } catch {
      return null;
    }
  };
  const checkPasswordValid = () => {
    if (!password && !checkPassword) return true;

    if (password !== checkPassword) {
      showErrorMessage('새 비밀번호를 확인해주세요');
      return false;
    }

    return true;
  };

  const startModify = () => {
    if (!profileData) return;

    setEditProfileImage(profileData.imageUrl ?? DEFAULT_PROFILE_IMAGE);
    setEditImageKey(null);
    setIsDefaultImageSelected(false);
    setEditName(profileData.name);
    setEditDepartment(profileData.department);
    setEditEmail(profileData.email);
    setPassword('');
    setCheckPassword('');
    setModify(true);
  };

  const saveModify = () => {
    if (!profileData || !checkPasswordValid()) return;

    if (!editName.trim() || !editEmail.trim() || !editDepartment) {
      showErrorMessage('이름, 이메일, 학과를 모두 입력해주세요');
      return;
    }

    const existingImageKey = extractImageKey(profileData.imageUrl);

    const request = {
      email: editEmail.trim(),
      name: editName.trim(),
      department: editDepartment,
      ...(isDefaultImageSelected
        ? { imageKey: null }
        : editImageKey
          ? { imageKey: editImageKey }
          : existingImageKey
            ? { imageKey: existingImageKey }
            : {}),
      ...(password ? { password } : {}),
    };

    updateMyProfileMutate(request, {
      onSuccess: () => {
        showErrorMessage('프로필이 수정되었습니다');
        setPassword('');
        setCheckPassword('');
        setEditImageKey(null);
        setIsDefaultImageSelected(false);
        setModify(false);
      },
      onError: () => {
        showErrorMessage('프로필 수정에 실패했습니다');
      },
    });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    e.currentTarget.value = '';

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
                setIsDefaultImageSelected(false);
              },
              onError: () => {
                showErrorMessage('이미지 업로드에 실패했습니다');
              },
            }
          );
        },
        onError: () => {
          showErrorMessage('이미지 업로드 URL 발급에 실패했습니다');
        },
      }
    );
  };

  const logout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await unregisterFcmToken();
    } catch (error) {
      console.error('FCM 토큰 삭제에 실패했습니다', error);
    } finally {
      localStorage.removeItem('accessToken');
      router.replace('/login');
    }
  };

  const handleDeleteUser = async () => {
    if (isDeleteUserPending || deleteConfirmText !== profileData?.username) {
      return;
    }

    try {
      await deleteUser();

      try {
        await unregisterFcmToken();
      } catch (error) {
        console.error('FCM 토큰 삭제에 실패했습니다', error);
      }

      localStorage.removeItem('accessToken');
      router.replace('/login');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        closeDeleteUserConfirm();
        showErrorMessage(
          '팀장 권한을 보유하고 있거나 진행 중인 투표가 있어 탈퇴할 수 없습니다'
        );
        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        showErrorMessage('로그인이 만료되었습니다');
        localStorage.removeItem('accessToken');
        router.replace('/login');
        return;
      }

      showErrorMessage('회원 탈퇴에 실패했습니다');
    }
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
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5] px-4">
        <div className="flex flex-col items-center">
          <p className="text-[15px] text-[#989898]">
            프로필 정보를 불러오지 못했습니다
          </p>

          <button
            type="button"
            onClick={() => refetchProfile()}
            className="mt-4 cursor-pointer rounded-xl bg-[#D9DEE7] px-4 py-2.5 text-[13px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-95"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 pt-6 pb-36 sm:px-6 lg:pb-24">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <NotificationButton />
        {errorMessage && (
          <div className="fixed top-5 left-1/2 z-[500] -translate-x-1/2 rounded-xl bg-[#2C2C2C] px-5 py-3 text-[14px] font-medium text-white shadow-lg">
            {errorMessage}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleProfileImageChange}
          className="hidden"
        />
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
        />

        <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-6 transition-all duration-200 sm:p-7 lg:h-[650px]">
            <div className="flex h-full flex-col">
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="relative h-36 w-36 shrink-0 transition-all duration-200 sm:h-44 sm:w-44">
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
                      type="button"
                      aria-label="프로필 이미지 변경"
                      onClick={() => setIsProfileImageMenuOpen(true)}
                      disabled={isImagePending}
                      className="absolute right-1 bottom-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#5E92F0] text-white shadow-md transition-all duration-150 active:scale-90 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
                    >
                      <Camera size={17} />
                    </button>
                  ) : profileData.isSchoolVerified ? (
                    <span
                      aria-label="학교 인증 완료"
                      className="absolute right-1 bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#A7ECA7] text-[#2C2C2C] shadow-md"
                    >
                      <Check size={21} />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push('/mypage/authentication')}
                      className="absolute -right-12 bottom-1 rounded-full bg-[#F67F8F] px-3 py-1.5 text-[12px] font-medium text-white shadow-md transition-all duration-150 active:scale-90"
                    >
                      학교 인증
                    </button>
                  )}
                </div>

                {!modify && (
                  <div className="animate-modal-pop flex flex-col items-center">
                    <h2 className="mt-5 text-[24px] font-bold text-[#2C2C2C]">
                      {profileData.name}
                    </h2>

                    <p className="mt-1 text-[17px] text-[#989898]">
                      @{profileData.username}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center gap-2 text-center text-[15px] text-[#989898]">
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
                      <p className="mt-1 text-[15px] text-[#989898]">
                        {profileData.studentNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!modify ? (
                <div className="animate-modal-pop mb-5 w-full shrink-0">
                  <div className="rounded-2xl bg-[#FBFBFB] px-5 py-4">
                    <p className="text-[15px] font-semibold text-[#2C2C2C]">
                      프로필 정보
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-[#989898]">
                      이름, 이메일, 비밀번호, 학과 정보를 수정할 수 있어요
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startModify}
                    className="mt-8 flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-[#D9DEE7] px-2.5 py-3 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-95"
                  >
                    <Pen size={12} />
                    수정하기
                  </button>
                </div>
              ) : (
                <div className="animate-modal-pop w-full shrink-0">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label="이름"
                    placeholder="이름"
                    className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-colors outline-none focus:border-[#5E92F0]"
                  />

                  <input
                    value={profileData.username}
                    disabled
                    aria-label="아이디"
                    placeholder="아이디"
                    className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-[#F5F5F5] p-2.5 pl-4 text-[#989898] outline-none"
                  />

                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    aria-label="이메일"
                    placeholder="이메일"
                    className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-colors outline-none focus:border-[#5E92F0]"
                  />

                  <div className="mb-2">
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      aria-label="학과"
                      className="w-full rounded-xl border border-[#D6DDE5] bg-white px-3 py-2.5 text-[#2C2C2C] transition-colors outline-none focus:border-[#5E92F0]"
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
                    aria-label="새 비밀번호"
                    placeholder="새 비밀번호"
                    className="mb-2 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-colors outline-none focus:border-[#5E92F0]"
                  />

                  <input
                    value={checkPassword}
                    onChange={(e) => setCheckPassword(e.target.value)}
                    type="password"
                    aria-label="새 비밀번호 확인"
                    placeholder="새 비밀번호 확인"
                    className="mb-3 w-full rounded-xl border border-[#D6DDE5] bg-white p-2.5 pl-4 text-[#2C2C2C] transition-colors outline-none focus:border-[#5E92F0]"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveModify}
                      disabled={isUpdatePending || isImagePending}
                      className="flex-1 cursor-pointer rounded-xl bg-[#A7ECA7] px-2.5 py-3 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#D6DDE5]"
                    >
                      {isUpdatePending ? '저장 중...' : '완료'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModify(false)}
                      disabled={isUpdatePending || isImagePending}
                      className="flex-1 cursor-pointer rounded-xl bg-[#D6DDE5] px-2.5 py-3 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
          <section className="relative h-full overflow-visible lg:h-[650px]">
            <section className="flex h-full flex-col rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5 sm:p-6">
              <h3 className="text-[20px] font-bold text-[#2C2C2C]">MY</h3>

              <div className="mt-5 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-5">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => router.push(item.path)}
                      className="flex min-h-[72px] w-full cursor-pointer items-center gap-4 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#FBFBFB] px-5 text-left text-[#2C2C2C] transition-all duration-150 hover:bg-white active:scale-[0.98] lg:h-full"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>

                      <span className="text-[17px] font-normal">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mt-4 flex items-center justify-end gap-3 lg:absolute lg:right-0 lg:-bottom-14 lg:mt-0">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#D9DEE7] px-3 py-2 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 hover:bg-[#DCEAFF] active:scale-90"
                >
                  <LayoutDashboard size={14} />
                  관리자 대시보드
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#D9DEE7] px-3 py-2 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 hover:bg-[#CED5E0] active:scale-90"
              >
                <Settings size={14} />
                설정
              </button>

              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#D9DEE7] px-3 py-2 text-[12px] font-medium text-[#2C2C2C] transition-all duration-150 hover:bg-[#CED5E0] active:scale-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={14} />
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </section>
        </section>

        <BottomNav />
        {isProfileImageMenuOpen && (
          <div
            onClick={() => setIsProfileImageMenuOpen(false)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="animate-modal-pop w-full max-w-[360px] rounded-3xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-center text-xl font-bold text-[#2C2C2C]">
                프로필 이미지 변경
              </h2>

              <p className="mt-1 text-center text-[15px] text-[#989898]">
                사용할 이미지를 선택해주세요
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditProfileImage(DEFAULT_PROFILE_IMAGE);
                    setEditImageKey(null);
                    setIsDefaultImageSelected(true);
                    setIsProfileImageMenuOpen(false);
                  }}
                  className="w-full cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
                >
                  기본 이미지 적용
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileImageMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full cursor-pointer rounded-xl bg-[#5E92F0] py-3 font-semibold text-white transition-all duration-200 active:scale-95"
                >
                  사진 찾아보기
                </button>

                <button
                  type="button"
                  onClick={() => setIsProfileImageMenuOpen(false)}
                  className="w-full cursor-pointer py-2 text-[14px] font-medium text-[#989898]"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
            <button
              type="button"
              aria-label="설정 닫기"
              className="absolute inset-0 cursor-default bg-black/40"
              onClick={() => setIsSettingsOpen(false)}
            />

            <section className="animate-modal-pop relative z-10 flex h-[calc(100dvh-2rem)] max-h-[760px] w-full max-w-[860px] flex-col overflow-hidden rounded-3xl border-[0.5px] border-[#D6DDE5] bg-[#F0F2F5] shadow-2xl sm:h-[calc(100dvh-4rem)]">
              <header className="flex h-16 shrink-0 items-center justify-between border-b-[0.5px] border-[#D6DDE5] bg-white px-5 sm:px-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#2C2C2C]">설정</h2>
                </div>

                <button
                  type="button"
                  aria-label="설정 닫기"
                  onClick={() => setIsSettingsOpen(false)}
                  className="cursor-pointer rounded-full p-2 text-[#2C2C2C] transition-colors hover:bg-[#F0F2F5] active:scale-90"
                >
                  <X size={22} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                <section className="mx-auto max-w-[720px]">
                  <div className="mb-4">
                    <h3 className="text-[18px] font-bold text-[#2C2C2C]">
                      계정 관리
                    </h3>
                    <p className="mt-1 text-[14px] leading-6 text-[#989898]">
                      계정과 관련된 설정을 관리할 수 있어요
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#FFD3D3] bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[17px] font-bold text-[#E22222]">
                          회원 탈퇴
                        </h4>
                        <p className="mt-2 text-[14px] leading-6 text-[#989898]">
                          탈퇴하면 계정과 관련된 정보가 삭제되며 복구할 수
                          없습니다
                        </p>
                        <p className="mt-1 text-[14px] leading-6 text-[#989898]">
                          팀장 권한을 보유하고 있거나 진행 중인 투표가 있으면
                          탈퇴할 수 없습니다
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={openDeleteUserConfirm}
                        className="cursor-pointer rounded-xl border border-[#FFD3D3] bg-[#FFF5F5] px-4 py-2.5 text-[14px] font-semibold text-[#E22222] transition-all duration-150 hover:bg-[#FFECEC] active:scale-95"
                      >
                        탈퇴하기
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          </div>
        )}

        {isDeleteUserConfirmOpen && (
          <div
            onClick={closeDeleteUserConfirm}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/45 px-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-user-title"
              onClick={(event) => event.stopPropagation()}
              className="animate-modal-pop w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-xl"
            >
              <h2
                id="delete-user-title"
                className="mt-4 text-center text-xl font-bold text-[#2C2C2C]"
              >
                정말 탈퇴할까요
              </h2>

              <p className="mt-2 text-center text-[14px] leading-6 text-[#989898]">
                탈퇴한 계정과 관련된 정보는 복구할 수 없습니다
              </p>

              <div className="mt-5 rounded-2xl bg-[#FBFBFB] p-4">
                <p className="text-[13px] leading-5 text-[#666666]">
                  계속하려면 아래 입력창에
                  <span className="mx-1 font-bold text-[#2C2C2C]">
                    {profileData.username}
                  </span>
                  을 정확히 입력해주세요
                </p>

                <input
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  disabled={isDeleteUserPending}
                  placeholder={profileData.username}
                  autoComplete="off"
                  autoFocus
                  spellCheck={false}
                  aria-label="탈퇴 확인 아이디"
                  className="mt-3 w-full rounded-xl border border-[#D6DDE5] bg-white px-4 py-3 text-[14px] text-[#2C2C2C] transition-colors outline-none focus:border-[#EF4444] disabled:bg-[#F6F8FA]"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteUserConfirm}
                  disabled={isDeleteUserPending}
                  className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3 font-semibold text-[#2C2C2C] transition-all duration-150 hover:bg-[#EEF1F5] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={
                    isDeleteUserPending ||
                    deleteConfirmText !== profileData.username
                  }
                  className="flex-1 cursor-pointer rounded-xl bg-[#EF4444] py-3 font-semibold text-white transition-all duration-150 hover:bg-[#DC3636] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#F6A5A5]"
                >
                  {isDeleteUserPending ? '탈퇴 중...' : '탈퇴'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
