import { Request, Response } from 'express';
import * as clientService from '../services/clients.service';

export const list = async (req: Request, res: Response) => {
    try {
        const clients = await clientService.list();
        return res.json(clients);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const client = await clientService.getById(id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        return res.json(client);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const newClient = await clientService.create(req.body);
        return res.status(201).json(newClient);
    } catch (error) {
        // Verifique se o erro é de constraint (P2002)
        return res.status(400).json({ error: 'Could not create client', details: error });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedClient = await clientService.update(id, req.body);
        return res.json(updatedClient);
    } catch (error) {
        return res.status(400).json({ error: 'Could not update client' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await clientService.remove(id);
        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({ error: 'Could not delete client' });
    }
};