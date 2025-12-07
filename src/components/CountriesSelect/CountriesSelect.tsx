import Select from "react-select";
import { api } from "~/trpc/react";

export const MultiCountriesSelect = ({
  value,
  onChange,
  className,
  options,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  options?: { label: string; value: string }[];
}) => {
  const trpcAny = api as unknown as any;
  const { data, isLoading } =
    trpcAny.languages?.getLanguages?.useQuery?.() ?? { data: undefined, isLoading: false };

  const languagesSelectOptions = options ?? data?.map((lang: any) => ({
    label: lang.name,
    value: lang.id,
  }));

  return (
    <Select
      options={languagesSelectOptions}
      value={languagesSelectOptions?.filter((option: any) =>
        value.includes(option.value),
      )}
      onChange={(newValue: any) => onChange((newValue || []).map((val: any) => val.value))}
      isSearchable
      isMulti
      isLoading={isLoading}
      className={className}
    />
  );
};
