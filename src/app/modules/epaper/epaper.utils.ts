import { IArticle } from './epaper.interface';

export const scaleCoordinates = (
  article: IArticle,
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
) => {
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;

  return {
    left: article.x * scaleX,
    top: article.y * scaleY,
    width: article.width * scaleX,
    height: article.height * scaleY,
  };
};

export const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  const filename = parts.pop() || '';
  return filename.split('.')[0];
};

export const generateArticleId = (
  pageNumber: number,
  index: number,
): string => {
  return `p${pageNumber}_a${index + 1}`;
};
