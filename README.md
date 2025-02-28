# Chaining Generative AI Models for Ideation in Creative Writing
We explore a Graphical Node-based interface for LLMs used to explore ideation and creativity for writers.
Users chain together generative AI models organised into nodes for creative tasks. This system was designed to overcome the structural constraints inherent in traditional chat-based, one-on-one interactions.

## Repository structure
The repository is divided into a React.js frontend and a Flask backend. Both can be set up by following the instructions in the README.md(s) of the respective folders. The .env file can be used to set the location of the backend where API calls are made to get output from LLMs. The front end uses ReactFlow to provide node-based functionality and to develop a baseline chat-based interface. Zustand is used for state management. 

To run the backend and frontend, you can follow the instructions given in the README's of each corresponding folder.

The **.json files that describe the predefined templates are available [here](./backend/PredefinedTemplates)**.
The backend uses OpenHermes-2.5-Mistral-7B and Stable Diffusion 2.1 via the transformers and diffusers libraries, respectively. We run the backend models on an NVIDIA RTX A6000 50GB GPU.

## The Graph-based creative writing interface
![Graph-based UI with a preloaded template for a wordbuilding task](./images/UI_for_graph_based_creative_writing_task.png)

On the right, you can see a world-building task. The corresponding predefined template for that task is visible in the sidebar on the left under custom Templates. After dragging a node into the interface, users can accordingly interact with nodes within the template.

## The Chat-based creative writing interface
![Chat-based UI](./images/UI_for_chat_based_creative_writing_task.png)
The chat-based creative interface is simpler, with a conversation in the center, the task right next to it and example queries to replicate the function of predefined templates on the right. 

## Algorithm for Topological sorting
![algo](./images/algo.png)
