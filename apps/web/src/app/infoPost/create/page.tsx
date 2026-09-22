'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import InfoPostForm, {
  type InfoPostFormData,
} from '@/components/infoPost/InfoPostForm';
import { useCreateInfoPost } from '@moimi/core/hooks/useInfoPostQuery';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useSchoolVerificationGuard } from '@moimi/core/hooks/useSchoolVerificationGuard';
import posthog from 'posthog-js';

export default function InfoPostCreatePage() {
  const router = useRouter();

  const { mutateAsync: createInfoPost } = useCreateInfoPost();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const { isVerified } = useSchoolVerificationGuard(showErrorMessage);

  useEffect(() => {
    if (isVerified === false) {
      router.replace('/infoPost?error=school-verification-required');
    }
  }, [isVerified, router]);

  const handleSubmit = async (form: InfoPostFormData) => {
    await createInfoPost({
      category: form.category,
      title: form.title,
      content: form.content,
      imageKeys: form.imageKeys,
    });
    posthog.capture('info_post_created', {
      category: form.category,
      image_count: form.imageKeys.length,
    });
    router.replace('/infoPost');
  };

  return (
    <>
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <InfoPostForm mode="create" onSubmit={handleSubmit} />
    </>
  );
}
