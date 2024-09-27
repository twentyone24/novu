import { NovuError, Preference } from '@novu/js';
import { useEffect, useState } from 'react';
import { useNovu } from './NovuProvider';

type UsePreferencesProps = {
  filter?: { tags?: string[] };
  onSuccess?: (data: Preference[]) => void;
  onError?: (error: NovuError) => void;
};

type UsePreferencesResult = {
  preferences?: Preference[];
  error?: NovuError;
  isLoading: boolean; // initial loading
  isFetching: boolean; // the request is in flight
  refetch: () => Promise<void>;
};

export const usePreferences = (props?: UsePreferencesProps): UsePreferencesResult => {
  const { onSuccess, onError } = props || {};
  const [data, setData] = useState<Preference[]>();
  const { preferences, on, off } = useNovu();
  const [error, setError] = useState<NovuError>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const sync = (event: { data?: Preference[] }) => {
    if (!event.data) {
      return;
    }
    setData(event.data);
  };

  useEffect(() => {
    fetchPreferences();

    on('preferences.list.updated', sync);
    on('preferences.list.pending', sync);
    on('preferences.list.resolved', sync);

    return () => {
      off('preferences.list.updated', sync);
      off('preferences.list.pending', sync);
      off('preferences.list.resolved', sync);
    };
  }, []);

  const fetchPreferences = async () => {
    setIsFetching(true);
    const response = await preferences.list(props?.filter);
    if (response.error) {
      setError(response.error);
      onError?.(response.error);
    } else {
      onSuccess?.(response.data!);
    }
    setIsLoading(false);
    setIsFetching(false);
  };

  const refetch = () => {
    preferences.cache.clearAll();

    return fetchPreferences();
  };

  return {
    preferences: data,
    error,
    isLoading,
    isFetching,
    refetch,
  };
};
