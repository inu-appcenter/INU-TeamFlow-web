import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import TeamForm, { type TeamFormData } from "@/components/TeamForm";
import { useCreateTeam } from "@moimi/core/hooks/team/useTeamQuery";
import { useSchoolVerificationGuard } from "@moimi/core/hooks/useSchoolVerificationGuard";

export default function TeamCreateScreen() {
  const router = useRouter();
  const { mutateAsync: createTeam } = useCreateTeam();

  const [errorMessage, setErrorMessage] = useState("");
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };
  const { isVerified } = useSchoolVerificationGuard(showErrorMessage);

  useEffect(() => {
    if (!isVerified) {
      router.replace("/team");
    }
  }, [isVerified]);

  const handleSubmit = async (form: TeamFormData) => {
    try {
      await createTeam({
        name: form.name,
        category: form.category,
        description: form.description,
        link: form.link || undefined,
        sns: form.sns || undefined,
        imageKey: form.imageUrl || undefined,
      });
      router.push("/team");
    } catch (err) {
      console.error("팀 생성 실패", err);
    }
  };

  return (
    <View className="flex-1">
      {errorMessage && (
        <View
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            zIndex: 50,
          }}
          className="items-center"
        >
          <View className="rounded-full bg-[#2C2C2C] px-5 py-2">
            <Text className="text-[13px] font-semibold text-white">
              {errorMessage}
            </Text>
          </View>
        </View>
      )}
      <TeamForm mode="create" onSubmit={handleSubmit} />
    </View>
  );
}
