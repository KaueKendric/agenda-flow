import { Request, Response } from 'express';
import * as professionalService from '../services/professionals.service';


export const list = async (req: Request, res: Response) => {
    try {
        const professionals = await professionalService.list();
        return res.json(professionals);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const professional = await professionalService.getById(id);
        
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }
        
        return res.json(professional);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const newProfessional = await professionalService.create(req.body);
        return res.status(201).json(newProfessional);
    } catch (error) {
        return res.status(400).json({ error: 'Could not create professional', details: error });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedProfessional = await professionalService.update(id, req.body);
        return res.json(updatedProfessional);
    } catch (error) {
        return res.status(400).json({ error: 'Could not update professional' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await professionalService.remove(id);
        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({ error: 'Could not delete professional' });
    }
};