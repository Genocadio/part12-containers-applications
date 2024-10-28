const express = require('express');
const { Todo } = require('../mongo');
const router = express.Router();

/* GET todos listing. */
router.get('/', async (_, res) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Check if the text field is provided
    if (!text) {
      return res.status(400).json({ error: 'Text field is required' });
    }

    const todo = await Todo.create({
      text,
      done: false,
    });
    res.status(201).json(todo); // Respond with 201 Created status
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findById(id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    req.todo = todo;
    next();
  } catch (error) {
    console.error('Error finding todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  try {
    await req.todo.delete();
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  try {
    res.json(req.todo); // Return the todo object as JSON
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  try {
    const { text, done } = req.body;

    const updatedData = {
      text: text !== undefined ? text : req.todo.text,
      done: done !== undefined ? done : req.todo.done,
    };
    
    const updatedTodo = await Todo.findByIdAndUpdate(req.todo._id, updatedData, { new: true });
    
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(updatedTodo); // Respond with the updated todo
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.use('/:id', findByIdMiddleware, singleRouter);

module.exports = router;
