import { cookies } from "next/headers";
import { pdfGenerationValuesCookieName } from "~/pageComponents/MenuPrintCreator/MenuPrintCreator.common";
import { MenuPrintCreatorPage } from "~/pageComponents/MenuPrintCreator/MenuPrintCreator.page";
import { type PrintCreatorFormValues } from "~/pageComponents/MenuPrintCreator/MenuPrintCreator.schema";

const getFormValuesFromCookies = async (): Promise<PrintCreatorFormValues | null> => {
  const getCookies = await cookies();
  const formValuesString = getCookies.get(pdfGenerationValuesCookieName)?.value;

  return formValuesString ? JSON.parse(formValuesString) : null;
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <MenuPrintCreatorPage
      slug={slug}
      initialCookiesFormValues={await getFormValuesFromCookies()}
    />
  );
}
