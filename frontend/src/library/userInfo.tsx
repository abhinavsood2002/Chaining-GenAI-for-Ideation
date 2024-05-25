import { userTasks } from "../states/UserInformation"
/**
 * Fetch user tasks from the backend and return the number as a string.
 * @param {string} userId - The ID of the user whose tasks are being requested.
 * @returns {Promise<string>} A promise that resolves to the number of tasks as a string.
 */
export async function fetchUserTasks(userId) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/get-user-task?userid=${userId}`,
    )
    if (!response.ok) {
      throw new Error("Failed to fetch tasks")
    }
    const data = await response.json()
    if (data.error) {
      console.error("Error fetching tasks:", data.error)
      throw new Error(data.error)
    }
    return String(data.tasks) // Convert the number to a string before returning
  } catch (error) {
    console.error("Failed to fetch user tasks:", error)
    throw error // Re-throw to let the caller handle the error
  }
}

/**
 * Fetch user orders from the backend and return the number as a string.
 * @param {string} userId - The ID of the user whose orders are being requested.
 * @returns {Promise<string>} A promise that resolves to the number of orders as a string.
 */
export async function fetchUserOrders(userId) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/get-user-order?userid=${userId}`,
    )
    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }
    const data = await response.json()
    if (data.error) {
      console.error("Error fetching orders:", data.error)
      throw new Error(data.error)
    }
    return String(data.orders) // Convert the number to a string before returning
  } catch (error) {
    console.error("Failed to fetch user orders:", error)
    throw error // Re-throw to let the caller handle the error
  }
}

// interfaceType 1 = graph 2 = chat
export function getTaskString(interfaceType, order, task) {
  if (interfaceType === "1") {
    if (order === "1" && task === "1") {
      return userTasks["11"]
    } else if (order === "2" && task === "1") {
      return userTasks["12"]
    } else if (order === "1" && task === "2") {
      return userTasks["21"]
    } else if (order === "2" && task === "2") {
      return userTasks["22"]
    }
  } else if (interfaceType === "2") {
    if (order === "1" && task === "1") {
      return userTasks["12"]
    } else if (order === "1" && task === "2") {
      return userTasks["22"]
    } else if (order === "2" && task === "1") {
      return userTasks["11"]
    } else if (order === "2" && task === "2") {
      return userTasks["21"]
    }
  }
}
