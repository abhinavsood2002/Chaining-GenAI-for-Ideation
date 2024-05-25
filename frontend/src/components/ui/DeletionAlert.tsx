import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
} from "@chakra-ui/react"
import React from "react"

export default function DeletionAlert({
  isOpen,
  onOpen,
  onClose,
  cancelRef,
  onClickYes,
}) {
  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>Discard Changes?</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          Are you sure you want to discard all nodes? This is irreversible.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button colorScheme="green" ref={cancelRef} onClick={onClose}>
            No
          </Button>
          <Button
            colorScheme="red"
            ml={3}
            onClick={() => {
              onClickYes()
              onClose()
            }}
          >
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
