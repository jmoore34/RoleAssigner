# RoleAssigner

## What is it?

[RoleAssigner](https://jmoore34.github.io/RoleAssigner/) is a web app for anonymously divvying up roles in a chat-room like interface. 

### Background

Role-based social deduction card games such as Mafia are generally difficult to play online because they necessitate anonymous assignment of roles as well as covert intra-team communicaton. Role assigner provides a free solutuion that addresses both these problems. 

### How to use

1. Create or join a room

![image](https://user-images.githubusercontent.com/1783464/165175644-8a33b700-0c10-4b98-a516-8856ef374ef8.png)

You can also share a room by copying the URL.

2. Collaboratively set up the roles, or use a preset

![image](https://user-images.githubusercontent.com/1783464/165176373-39f3364a-d3a8-4323-9692-66559e8df6a2.png)

3. Set your name, and optionally opt-in to become a moderator

Moderators do not recieve roles, and only moderators can see the roles of everyone else.

![image](https://user-images.githubusercontent.com/1783464/165180555-07855b02-a44c-475d-8522-0d42bb784def.png)

4. Press "Assign roles to users", and everyone (except moderators) will anonymously recieve a role.

![image](https://user-images.githubusercontent.com/1783464/165181271-0b69eb00-ebe2-41d8-871f-8d30dbb85894.png)

5. Use the special chat functions, such as anonymous chat, team chat, moderator-directed chat, and more.

![image](https://user-images.githubusercontent.com/1783464/165177620-3c2aea94-5fc9-41ff-88ba-886f14a0294d.png)

![image](https://user-images.githubusercontent.com/1783464/165181859-9ece024a-c21d-40a2-a105-d83adf8d16dd.png)


## Technical details

RoleAssigner was developed by Jonathan Moore and Christopher Sweetman. The websocket backend was developed in Kotlin using the Ktor web framework, and the frontend was written in TypeScript using React, styled-components, and Material UI.
