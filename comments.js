// Create web server
// 1. Create web server
// 2. Create route handlers
// 3. Listen for incoming requests

// 1. Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();
app.use(bodyParser.json());

// 2. Create route handlers
// Create an object to store comments
const commentsByPostId = {};

// Get comments by post id
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Create a comment for a post
app.post('/posts/:id/comments', async (req, res) => {
  // Generate a random id for the comment
  const commentId = randomBytes(4).toString('hex');
  // Get the content of the comment
  const { content } = req.body;

  // Get the comments array for this post
  const comments = commentsByPostId[req.params.id] || [];
  // Push the new comment to the comments array
  comments.push({ id: commentId, content, status: 'pending' });
  // Update the comments array for this post
  commentsByPostId[req.params.id] = comments;

  // Send an event to the event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending'
    }
  });

  // Send the comment to the client
  res.status(201).send(comments);
});

// Receive events from the event bus
app.post('/events', async (req, res) => {
  console.log('Received Event', req.body.type);

  // Get the data from the event
  const { type, data } = req.body;

  // Check if the event type is CommentModerated
  if (type === 'CommentModerated') {
    // Get the comments array for this post
    const comments = commentsByPostId[data.postId];

    // Find the comment in the comments array
    const comment = comments.find(comment => {
      return comment.id === data.id;
    });

    // Update the status of the comment