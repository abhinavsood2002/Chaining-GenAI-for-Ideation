import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
  Container,
} from "@chakra-ui/react"
import React from "react"

export default function SubmissionAlert({
  isOpen,
  onOpen,
  onClose,
  cancelRef,
  onClickYes,
  text,
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
        <AlertDialogHeader>Submit Task 2?</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          Are you sure you want submit Task 2 and Move to Task 1/Survey? This is
          irreversible. Ensure that the notepad contains your answer. Your
          current task 2 submission is:
          <Container>{text}</Container>
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
