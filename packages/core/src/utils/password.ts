export type PasswordRule = {
  key: "length" | "letter" | "number" | "special";
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", label: "8자 이상", test: (pw) => pw.length >= 8 },
  { key: "letter", label: "영문 포함", test: (pw) => /[A-Za-z]/.test(pw) },
  { key: "number", label: "숫자 포함", test: (pw) => /\d/.test(pw) },
  {
    key: "special",
    label: "특수문자",
    // 영문·숫자·공백이 아닌 문자 = 특수문자
    test: (pw) => /[^A-Za-z0-9\s]/.test(pw),
  },
];

export const isValidPassword = (password: string) =>
  PASSWORD_RULES.every((rule) => rule.test(password));

export const PASSWORD_RULE_MESSAGE =
  "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 해요";
