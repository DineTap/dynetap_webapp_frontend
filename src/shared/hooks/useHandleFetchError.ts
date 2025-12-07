import { TRPCClientError } from "@trpc/client";
import { useEffect, useRef } from "react";
import type { AppRouter } from "~/server/api/root"; // make sure this points to your root router

export const useHandleFetchError = ({
  error,
  onError,
}: {
  error: TRPCClientError<AppRouter> | null;
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
