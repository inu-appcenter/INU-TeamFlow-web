export interface PostPaginationProps {
  page: number;
  totalPages: number;
  windowSize: number;
  onPageChange: (page: number) => void;
}
