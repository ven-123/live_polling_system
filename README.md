# Live Polling System

This project is a real-time polling application developed as part of an assignment for the recruitment process.

The application allows a teacher to create and start polls, and students to participate and vote in real time. The results are updated instantly for all connected users.

## Features

Teacher Side
- Create a poll with question and options
- Set poll duration
- Start and close polls
- View live voting results

Student Side
- Join the system by entering name
- Receive poll questions in real time
- Submit vote within the given time
- View live results
- Multiple voting is restricted

System Features
- Real-time communication using Socket.io
- Timer synchronization between server and clients
- Data persistence using MongoDB
- Handles page refresh and reconnection

## Tech Stack Used

Frontend
- React
- Socket.io Client
- Axios
- CSS

Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io

## Project Structure

backend/
- Handles API requests, database, and socket connections

frontend/
- User interface for teacher and student
- Connects to backend using REST APIs and Socket.io

## How to Run the Project

Backend
1. Navigate to backend folder
   cd backend
2. Install dependencies
   npm install
3. Add environment variables in .env file
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/live_polling_system
4. Start the server
   npm run dev

Frontend
1. Navigate to frontend folder
   cd frontend
2. Install dependencies
   npm install
3. Start the application
   npm start

The application will be available at http://localhost:3000

## Usage

- Open the application in browser
- Select role as Student or Teacher
- Teacher can create and activate polls
- Students can vote and see live results

## Assignment Objective

The goal of this assignment was to demonstrate:
- Full stack development skills
- Real-time data handling using WebSockets
- Proper separation of frontend and backend
- Handling timers and concurrent users

## Notes

This project was developed independently as part of the recruitment assignment and focuses on functionality and real-time behavior rather than UI design.

## Author

Developed by a student as part of an assignment submission.
