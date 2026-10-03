import { Trash2Icon } from 'lucide-react'
import type React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

type Props = {
  onDelete: () => void
  entityName: string
  disabled?: boolean
} & React.HTMLAttributes<HTMLButtonElement>

export default function DeleteDialog({
  onDelete,
  entityName,
  disabled,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive">
            <Trash2Icon />
            Delete
          </Button>
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {entityName}</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this {entityName} and all its
            associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          {disabled ? (
            <Button variant="destructive" disabled>
              <Trash2Icon />
              Delete
            </Button>
          ) : (
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              <Trash2Icon />
              Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
