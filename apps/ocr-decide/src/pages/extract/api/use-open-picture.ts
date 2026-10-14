import { useCallback } from "react";

import { useSetPicture } from "#/pages/extract/model/draft";

import { openPicture } from "./load-picture";

const useOpenPicture = (): ((name: string, url: string) => void) => {
  const setPicture = useSetPicture();
  return useCallback(
    (name: string, url: string) => {
      setPicture({ status: "loading", name });
      openPicture({ name, url, done: setPicture });
    },
    [setPicture],
  );
};

export { useOpenPicture };
