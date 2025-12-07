import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/trpc/react";

export const DefaultLanguagesSelector = ({
  menuId,
  initialDefaultLanguage,
}: {
  menuId: string;
  initialDefaultLanguage: string;
}) => {
  // const { mutateAsync } = api.languages.changeDefaultLanguage.useMutation();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [selectedDefaultLanguage, setSelectedDefaultLanguage] =
    useState<string>(initialDefaultLanguage);

  // const handleUpdateLanguages = async () => {
  //   await mutateAsync({ menuId, language: selectedDefaultLanguage });
  //   toast({
  //     title: t("defaultLanguageSelector.changeSavedTitle"),
  //     description: t("defaultLanguageSelector.changeSavedDescription"),
  //   });
  // };

  return (
    <div className="flex flex-row gap-4">
      <input
        type="text"
        value={selectedDefaultLanguage}
        onChange={(e) => setSelectedDefaultLanguage(e.target.value)}
        className="w-full border rounded p-2"
      />
      {/* <Button onClick={handleUpdateLanguages}> */}
      <Button>
        {t("defaultLanguageSelector.save")}
      </Button>
    </div>
  );
};
