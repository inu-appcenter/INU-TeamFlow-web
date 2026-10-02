'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import PolicyContent from '@/components/register/PolicyContent';

import {
  communityGuidelines,
  privacyPolicy,
  termsPolicy,
  youthProtectionPolicy,
} from '@moimi/core/constants/policies/index';

import type { PolicyDocument, PolicyType } from '@moimi/core/types/policy';

interface PolicyModalProps {
  type: PolicyType | null;
  onClose: () => void;
}

const POLICY_MAP: Record<PolicyType, PolicyDocument> = {
  terms: termsPolicy,
  privacy: privacyPolicy,
  community: communityGuidelines,
  youth: youthProtectionPolicy,
};

export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!type) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, onClose]);

  const policy = type ? POLICY_MAP[type] : null;

  return (
    <AnimatePresence>
      {policy && (
        <motion.div
          key={type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            transition={{
              duration: 0.18,
              ease: 'easeOut',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-policy-title"
            className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex shrink-0 items-start justify-between border-b border-[#ECEFF2] px-6 py-5">
              <div className="min-w-0 pr-4">
                <h2
                  id="register-policy-title"
                  className="text-[20px] font-semibold break-keep text-[#2C2C2C]"
                >
                  {policy.title}
                </h2>

                <p className="-mb-1 text-[13px] text-[#989898]">
                  내용을 확인한 후 닫아주세요.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="정책 닫기"
                className="shrink-0 cursor-pointer rounded-lg text-[#989898] transition-all hover:bg-[#F0F2F5] hover:text-[#2C2C2C] active:scale-90"
              >
                <X size={21} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <PolicyContent policy={policy} />
            </div>

            <div className="shrink-0 border-t border-[#ECEFF2] px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer rounded-xl bg-[#5E92F0] py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-[0.99]"
              >
                확인
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
