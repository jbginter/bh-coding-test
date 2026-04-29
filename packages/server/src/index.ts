import express from 'express';
import cors from 'cors';
import playersRouter from './routes/players';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/players', playersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
