export interface PostDeleteConfirmModalProps {
  postLabel: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
