import { useEffect, useRef } from "react";

export const useHandleFetchError = ({
  error,
  onError,
}: {
  error: Error | null;
  onError: () => void;
}) => {
  const errorSentRef = useRef(false);

  useEffect(() => {
    if (errorSentRef.current) return;
    if (error) {
      onError();
      errorSentRef.current = true;
    }
  }, [error, onError]);
};
