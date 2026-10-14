import type { ReactNode } from "react";

import { usePicture } from "#/pages/extract/model/draft";

const PicturePreview = (): ReactNode => {
  const picture = usePicture();
  if (picture.status !== "ready") {
    return "";
  }
  return <img src={picture.url} alt={picture.name} className="max-h-120 w-fit rounded border" />;
};

export { PicturePreview };
