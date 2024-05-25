import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { userIds } from "../../states/UserInformation"
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  ListItem,
  OrderedList,
} from "@chakra-ui/react"
import { fetchUserOrders } from "../../library/userInfo"

function LoginPage() {
  const [userId, setUserId] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    // Check if the user ID is valid (e.g., in your database)
    if (userIds.includes(userId)) {
      localStorage.clear()
      localStorage.setItem("userId", userId)
      if ((await fetchUserOrders(localStorage.getItem("userId"))) === "1") {
        navigate("/app")
      } else {
        navigate("/chat")
      }
    } else {
      // Handle invalid user ID
      alert("Invalid user ID")
    }
  }

  return (
    <Container maxW="xl">
      <Box mt={8} textAlign="center">
        <Heading>Chaining AI Models for Creative Writing Tasks - Login</Heading>
        <FormControl mt={4}>
          <FormLabel>User ID</FormLabel>
          <Input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </FormControl>
        <Button mt={4} colorScheme="teal" onClick={handleLogin}>
          Login
        </Button>
      </Box>
      <Box mt={12} textAlign="center">
        <Text>
          In this study, you will be completing a total of 3 tasks. We recommend
          using a laptop or a PC with a monitor to take part in this study.
          Please watch the provided video before beginning. The order of the
          first 2 tasks might be different for you and depends on your userId.
          Refreshing the page or navigating back and forth may lead to
          unexpected behavior.{" "}
        </Text>
        <OrderedList spacing={3} mt={4} ml={6}>
          <ListItem>
            In task 1/2, you will use a custom interface we have developed to
            complete a short given creative writing task.
          </ListItem>
          <ListItem>
            For task 1/2, you will use a chat interface to complete a similar
            task.
          </ListItem>
          <ListItem>
            Task 3 involves completing a short survey based on your experience
            in task 1 and task 2.
          </ListItem>
        </OrderedList>
      </Box>
    </Container>
  )
}

export default LoginPage
