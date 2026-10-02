import type { PolicyDocument } from "../../types/policy";

export const youthProtectionPolicy = {
  type: "youth",

  pageName: "청소년 보호정책",

  title: "모이미 청소년 보호정책",

  sections: [
    {
      id: "under-14",
      title: "만 14세 미만 이용자 보호",

      blocks: [
        {
          type: "paragraph",
          text: "모이미 서비스는 만 14세 이상 이용자만 회원가입할 수 있습니다.",
        },
        {
          type: "paragraph",
          text: "회원가입 시 이용자는 본인이 만 14세 이상임을 확인해야 합니다.",
        },
        {
          type: "paragraph",
          text: "이용자가 만 14세 미만인 사실이 확인된 경우, 운영팀은 해당 계정의 이용을 제한하거나 삭제할 수 있습니다.",
        },
      ],
    },
  ],
} satisfies PolicyDocument;
