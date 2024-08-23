import { TranslateFunctionArg, useLocalization } from '../../context';
import { LocalizationKey } from '../../types';

type LocalizedProps<K extends LocalizationKey> = {
  localizationKey: K;
} & (TranslateFunctionArg<K> extends undefined
  ? { data?: undefined } // If no data is required, exclude the data prop
  : { data: TranslateFunctionArg<K> });

export const Localized = <K extends LocalizationKey>(props: LocalizedProps<K>) => {
  const { t } = useLocalization();

  //@ts-expect-error weird ts behaviour on props.data
  return <span data-localization={props.localizationKey}>{t(props.localizationKey, props.data)}</span>;
};
