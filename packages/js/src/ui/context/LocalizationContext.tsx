import { Accessor, createContext, createMemo, ParentProps, useContext } from 'solid-js';
import { defaultLocalization, dynamicLocalization } from '../config/defaultLocalization';

type DefaultLocalizationKey = keyof typeof defaultLocalization;
// eslint-disable-next-line @typescript-eslint/ban-types
export type LocalizationKey = DefaultLocalizationKey;

export type FunctionLocalizationKey = {
  [K in DefaultLocalizationKey]: (typeof defaultLocalization)[K] extends (...args: any[]) => any ? K : never;
}[DefaultLocalizationKey];

export type StringLocalizationKey = {
  [K in DefaultLocalizationKey]: (typeof defaultLocalization)[K] extends string ? K : never;
}[DefaultLocalizationKey];

export type LocalizationValueOverride<K extends LocalizationKey> = K extends FunctionLocalizationKey
  ? (...args: Parameters<(typeof defaultLocalization)[K]>) => ReturnType<(typeof defaultLocalization)[K]>
  : K extends StringLocalizationKey
  ? string
  : string; // Allow any string value for arbitrary keys

export type Localization = {
  [K in DefaultLocalizationKey]?: (typeof defaultLocalization)[K] extends (...args: infer P) => any
    ? ((...args: P) => ReturnType<(typeof defaultLocalization)[K]>) | string
    : string;
} & {
  dynamic?: Record<string, string>;
};

export type TranslateFunctionArg<K extends LocalizationKey> = K extends keyof typeof defaultLocalization
  ? (typeof defaultLocalization)[K] extends (arg: infer A) => any
    ? A
    : undefined
  : undefined;

export type TranslateFunction = <K extends LocalizationKey>(
  key: K,
  ...args: TranslateFunctionArg<K> extends undefined
    ? [undefined?] // No arguments needed if TranslateFunctionArg<K> is undefined
    : [TranslateFunctionArg<K>] // A single argument is required if TranslateFunctionArg<K> is defined
) => string;

type LocalizationContextType = {
  t: TranslateFunction;
  locale: Accessor<string>;
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

type LocalizationProviderProps = ParentProps & { localization?: Localization };

export const LocalizationProvider = (props: LocalizationProviderProps) => {
  const splitLocalization = createMemo(() => {
    const { dynamic, ...rest } = props.localization || {};

    return { dynamic: dynamic || {}, localizationObject: rest };
  });
  // eslint-disable-next-line @typescript-eslint/ban-types
  const localization = createMemo<Record<string, string | Function>>(() => {
    const { dynamic, localizationObject } = splitLocalization();

    return {
      ...defaultLocalization,
      ...dynamicLocalization(),
      ...dynamic,
      ...localizationObject,
    };
  });

  const t: LocalizationContextType['t'] = (key, ...args) => {
    const value = localization()[key];
    if (typeof value === 'function') {
      return value(args[0]);
    }

    return value as string;
  };

  const locale = createMemo(() => localization().locale as string);

  return (
    <LocalizationContext.Provider
      value={{
        t,
        locale,
      }}
    >
      {props.children}
    </LocalizationContext.Provider>
  );
};

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within an LocalizationProvider');
  }

  return context;
}
