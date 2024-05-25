import React from "react"
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react"

const GoogleFormPrompt = () => {
  const formLink =
    "https://docs.google.com/forms/d/e/1FAIpQLSdPBfpAGuZlAaEvTiusTwx-jqznS2ghIorCXj4ggReGjeqCkA/viewform?usp=sf_link"

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bg="gray.50"
      p={8}
    >
      <VStack spacing={4} align="center">
        <Heading as="h1" size="xl" color="teal.500">
          Thank You. Please Complete the (short) Google Form
        </Heading>
        <Text fontSize="lg" textAlign="center">
          Please fill out the following Google Form to help us collect the
          required data.
        </Text>
        <Button
          colorScheme="teal"
          size="lg"
          as="a"
          href={formLink}
          target="_blank"
        >
          Go to Google Form
        </Button>
      </VStack>
    </Box>
  )
}

export default GoogleFormPrompt
