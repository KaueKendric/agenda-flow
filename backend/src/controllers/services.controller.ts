import { Request, Response } from 'express';
import * as serviceService from '../services/services.service';

export const list = async (req: Request, res: Response) => {
    try {
        const services = await serviceService.list();
        return res.json(services);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const service = await serviceService.getById(id);
        if (!service) return res.status(404).json({ error: 'Service not found' });
        return res.json(service);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const newService = await serviceService.create(req.body);
        return res.status(201).json(newService);
    } catch (error) {
        return res.status(400).json({ error: 'Could not create service' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedService = await serviceService.update(id, req.body);
        return res.json(updatedService);
    } catch (error) {
        return res.status(400).json({ error: 'Could not update service' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await serviceService.remove(id);
        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({ error: 'Could not delete service' });
    }
};