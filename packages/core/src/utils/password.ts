export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

// 키보드 기본 특수문자 (ASCII 32개): !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
const SPECIAL_CHAR_REGEX = /[!-/:-@[-`{-~]/;
// 영문 / 숫자 / ASCII 특수문자만 허용
const ALLOWED_CHARS_REGEX = /^[A-Za-z0-9!-/:-@[-`{-~]*$/;

export type PasswordRule = {
  key: "length" | "letter" | "number" | "special";
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    key: "length",
    label: `${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자`,
    test: (pw) =>
      pw.length >= PASSWORD_MIN_LENGTH && pw.length <= PASSWORD_MAX_LENGTH,
  },
  { key: "letter", label: "영문 포함", test: (pw) => /[A-Za-z]/.test(pw) },
  { key: "number", label: "숫자 포함", test: (pw) => /\d/.test(pw) },
  {
    key: "special",
    label: "특수문자",
    test: (pw) => SPECIAL_CHAR_REGEX.test(pw),
  },
];

// 입력값에서 공백 제거 (스페이스·탭·붙여넣기 공백 모두)
export const removeWhitespace = (value: string) => value.replace(/\s/g, "");

// 한글·이모지 등 허용하지 않는 문자가 섞여 있는지
export const hasInvalidPasswordChar = (password: string) =>
  !ALLOWED_CHARS_REGEX.test(password);

export const isValidPassword = (password: string) =>
  !hasInvalidPasswordChar(password) &&
  PASSWORD_RULES.every((rule) => rule.test(password));

export const PASSWORD_RULE_MESSAGE = `비밀번호는 영문, 숫자, 특수문자를 포함해 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자여야 해요`;

export const PASSWORD_INVALID_CHAR_MESSAGE =
  "영문, 숫자, 특수문자만 사용할 수 있어요";
