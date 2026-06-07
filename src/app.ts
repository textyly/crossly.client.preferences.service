import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`crossly.client.preferences.service listening on port ${port}`);
});

export default app;
